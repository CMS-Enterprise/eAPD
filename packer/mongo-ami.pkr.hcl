variable "vpc_id" {}
variable "subnet_id" {}
variable "ami_name" {}
variable "gold_owner" {}
variable "mongo_database" {}
variable "mongo_initdb_root_username" {}
variable "mongo_initdb_root_password" {}
variable "mongo_initdb_database" {}
variable "mongo_database_username"{}
variable "mongo_database_password" {}
variable "mongo_url" {}
variable "postgres_url" {}
#variable "security_group_id" {}

locals { timestamp = regex_replace(timestamp(), "[- TZ:]", "") }

source "amazon-ebs" "Golden_Image" {
    ami_name      = "eAPD Staging Mongo AMI - ${local.timestamp}"
#    instance_type = "t3.micro"
    instance_type = "t3.small"
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
        owners      = [var.gold_owner]
    }
    ssh_username = "ec2-user"
    associate_public_ip_address = true
    vpc_id = var.vpc_id
    subnet_id = var.subnet_id
#    security_group_id = var.security_group_id
}

build {
    sources = ["source.amazon-ebs.Golden_Image"]



    provisioner "shell" {
        environment_vars = [
            "MONGO_DATABASE=${var.mongo_database}",
            "MONGO_INITDB_ROOT_USERNAME=${var.mongo_initdb_root_username}",
            "MONGO_INITDB_ROOT_PASSWORD=${var.mongo_initdb_root_password}",
            "MONGO_INITDB_DATABASE=${var.mongo_initdb_database}",
            "MONGO_DATABASE_USERNAME=${var.mongo_database_username}",
            "MONGO_DATABASE_PASSWORD=${var.mongo_database_password}",
            "MONGO_URL=${var.mongo_url}",
            "POSTGRES_URL=${var.postgres_url}"
        ]
        script = "./mongo.sh"
    }
}
