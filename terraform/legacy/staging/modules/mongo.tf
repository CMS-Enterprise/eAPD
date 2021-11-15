data "aws_ami" "latest_golden_image" {
    most_recent = true
    owners = ["842420567215"]
        filter {
            name = "name"
            values = ["EAST-RH 7-9 Gold Image V.*"]
        }
        filter {
            name   = "virtualization-type"
            values = ["hvm"]
        }
}

resource "aws_instance" "eapd_mongo_staging" {
#    ami                         = data.aws_ami.latest_golden_image.id
    ami                         = "ami-0ca43bc063f64efe3"
    instance_type               = "m3.medium"
    vpc_security_group_ids      = ["sg-01e01435dbbe6ce32", aws_security_group.eapd-staging-mongo-ec2.id]
    subnet_id                   = "subnet-07e1b9ed6ed5fb8c7"
    key_name                    = "eapd_bbrooks"
    user_data                   = "../../../bin/prod-deploy/aws.user-data.sh"
    tags = {
        Name = "eAPD Staging MongoDB"
        Environment = "staging"
        "Patch Group" = "RHEL7"
        "cms-cloud-exempt:open-sg" = "CLDSPT-5877"
        "Patch Window" = "ITOPS-Wave1-Non-Mktplc-Prod-MW"
        Terraform = "True"
    }
    depends_on = [aws_security_group.eapd-staging-mongo-ec2]
}
