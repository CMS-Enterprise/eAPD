#!/bin/bash
# Call with the following arguments:
#    --AWS_REGION <AWS region name>   | The AWS region the instance should be
#                                     | created in

# Exit when any command fails
set -e

# Deploys a preview instance to EC2 with a fully self-contained environment.
function cleanupPlatinumAMI() {
  # Configure AWS CLI with defaults
  configureAWS
  
  printf "• Finding state of AWS environment\n"
  waitForAtRest
  printf "• Finding available Platinum AMIs\n"
  getAvailableAMIs
  printf "• Checking for Platinum AMIs currently in use\n"
  checkAMIForUsage
  printf "• Checking for the most recently created Platinum AMI\n"
  getMostRecentAMI
  printf "• AMI actions being taken\n"
  deregisterIfNotUsed
}

function configureAWS() {
  aws configure set default.region $AWS_REGION
}

# Finds all existing platinum AMIs
function getAvailableAMIs() {
  aws ec2 describe-images \
    --owner self \
    --filter 'Name=name,Values=eAPD Platinum AMI - *' \
    | jq -rc '.Images[].ImageId' 
}

function checkAMIForUsage() {
  AVAIL_AMIS=$(getAvailableAMIs)
  for AMI_ID in $AVAIL_AMIS
  do 
    aws ec2 describe-instances \
      --filter Name=image-id,Values="$AMI_ID" \
      | jq -rc '.Reservations[].Instances[] | .ImageId'
  done
}

function getMostRecentAMI() {
  aws ec2 describe-images \
    --owners self \
    --filters "Name=name,Values=eAPD Platinum AMI - *" \
    --query 'sort_by(Images, &CreationDate)[-1].ImageId' \
    --output text
}

function deregisterIfNotUsed() {
  AVAIL_AMIS=$(getAvailableAMIs)
  IN_USE_AMIS=$(checkAMIForUsage)
  MOST_RECENT_AMI=$(getMostRecentAMI)
  for AMI_ID in $AVAIL_AMIS
  do
    if [[ $AMI_ID == $IN_USE_AMIS ]] || [[ $AMI_ID == $MOST_RECENT_AMI ]]; then
      printf "Keeping $AMI_ID\n"
    else
      aws ec2 deregister-image --image-id $AMI_ID
      printf "Deregistering $AMI_ID\n"
    fi
  done
}

# Gets State of Instances"
function getInMotionInstanceIds() {
  aws ec2 describe-instances \
    --filter "Name=instance-state-name,Values=pending,rebooting,stopping,shutting-down" \
    | jq -rc '.Reservations[].Instances[].State.Name'
}

# This function is to make sure the environment is at rest
# No pending, stopping, rebooting Instances
function waitForAtRest() {
  INMOTION_INSTANCES=$(getInMotionInstanceIds)
  sleep 15
  while [[ $INMOTION_INSTANCES == "pending" ]] || [[ $INMOTION_INSTANCES == "rebooting" ]] || [[ $INMOTION_INSTANCES == "stopping" ]] || [[ $INMOTION_INSTANCES == "shutting-down" ]]; do
    printf "There are in motion Instances\n"
    sleep 300
  done

  printf "There are no Instances in motion\n"
}

cleanupPlatinumAMI
