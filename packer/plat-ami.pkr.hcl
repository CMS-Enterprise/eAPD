variable "vpc_id" {}
variable "subnet_id" {}
variable "ami_name" {}
variable "gold_owner" {}

locals { timestamp = regex_replace(timestamp(), "[- TZ:]", "") }

source "amazon-ebs" "Golden_Image" {
    ami_name      = "eAPD Platinum AMI - ${local.timestamp}"
    instance_type = "t3.micro"
    access_key    = ""
    secret_key    = ""
    region        = ""
    source_ami_filter {
        filters = {
            name                = "EAST-RH 7-9 Gold Image V.*"
            root-device-type    = "ebs"
            virtualization-type = "hvm"
        }
        most_recent = true
        owners      = ["var.gold_owner"]
    }
    ssh_username = "ec2-user"
    associate_public_ip_address = true
    vpc_id = var.vpc_id
    subnet_id = var.subnet_id
}

build {
    sources = ["source.amazon-ebs.Golden_Image"]

    provisioner "shell" {
        script = "bootstrap.sh"
    }
    provisioner "ansible" {
      playbook_file = "ansible/nginx.yml"
    }
}
