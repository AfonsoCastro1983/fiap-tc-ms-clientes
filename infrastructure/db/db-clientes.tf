provider "aws" {
  region = "us-east-2"
}

resource "aws_db_instance" "fiap-ms-cliente" {
  allocated_storage    = 20
  max_allocated_storage = 100
  storage_type         = "gp2"
  engine               = "postgres"
  instance_class       = "db.t3.nano"
  name                 = "ms-cliente"
  username             = var.db_username
  password             = var.db_password
  publicly_accessible  = true
  skip_final_snapshot  = true

  vpc_security_group_ids = [aws_security_group.fiap-ms-cliente-SG.id]

  tags = {
    Application = "FIAP-TechChallenge"
    Name = "rds-fiap-ms-cliente"
  }
}

resource "aws_security_group" "fiap-ms-cliente-SG" {
  name_prefix = "db-access-"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Application = "FIAP-TechChallenge"
    Name = "RDS-fiap-ms-cliente-SG"
  }
}
