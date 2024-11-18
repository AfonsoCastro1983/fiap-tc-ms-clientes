#Criação do ECS
provider "aws" {
  region = "us-east-2"
}

# Criar VPC
resource "aws_vpc" "ms_clientes_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_Clientes-ECS-VPC"
  }
}

# Subnet pública
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.ms_clientes_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-2a"

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_Clientes-ECS-Public-Subnet"
  }
}

# Gateway de Internet
resource "aws_internet_gateway" "ms_clientes_igw" {
  vpc_id = aws_vpc.ms_clientes_vpc.id

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_Clientes-ECS-Internet-Gateway"
  }
}

# Tabela de Roteamento
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.ms_clientes_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.ms_clientes_igw.id
  }

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_Clientes-ECS-Public-Route-Table"
  }
}

# Associação da Tabela de Roteamento à Subnet
resource "aws_route_table_association" "public_route_association" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}

# Security Group para EC2/ECS
resource "aws_security_group" "ecs_sg" {
  vpc_id = aws_vpc.ms_clientes_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
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
    Name        = "ms_Clientes-ECS-SG"
    Application = "FIAP-TechChallenge"
  }
}

# Cluster ECS
resource "aws_ecs_cluster" "ms_clientes_cluster" {
  name = "ms_Clientes-ECS-Cluster"

  tags = {
    Name        = "ms_Clientes-ECS-Cluster"
    Application = "FIAP-TechChallenge"
  }
}

# IAM Role para EC2
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecsInstanceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name        = "ecs-instance-role"
    Application = "FIAP-TechChallenge"
  }
}

# Anexar políticas ao IAM Role
resource "aws_iam_policy_attachment" "ecs_instance_role_policy" {
  name       = "ecs-instance-role-policy"
  roles      = [aws_iam_role.ecs_instance_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# Key Pair para SSH
resource "aws_key_pair" "ecs_key" {
  key_name   = "ecs_key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# EC2 Instance para ECS
resource "aws_instance" "ecs_instance" {
  ami                    = data.aws_ami.ecs_optimized.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.ecs_key.key_name
  subnet_id              = aws_subnet.public_subnet.id
  associate_public_ip_address = true
  iam_instance_profile   = aws_iam_instance_profile.ecs_instance_profile.id
  security_groups        = [aws_security_group.ecs_sg.id]

  tags = {
    Name        = "ms_Clientes-ECS-Instance"
    Application = "FIAP-TechChallenge"
  }
}

# AMI para ECS Otimizado
data "aws_ami" "ecs_optimized" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
  }
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecs-instance-profile"
  role = aws_iam_role.ecs_instance_role.name
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ms_clientes_task" {
  family                   = "ms_Clientes-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"

  container_definitions = jsonencode([{
    name      = "typescript-app"
    image     = "992382363343.dkr.ecr.us-east-2.amazonaws.com/ms-clientes:latest" #Imagem do microserviço
    essential = true
    portMappings = [
      {
        containerPort = 80
        hostPort      = 80
        protocol      = "tcp"
      }
    ]
  }])

  tags = {
    Name        = "ms_Clientes-Task-Definition"
    Application = "FIAP-TechChallenge"
  }
}

# ECS Service
resource "aws_ecs_service" "ms_clientes_service" {
  name            = "ms_Clientes-service"
  cluster         = aws_ecs_cluster.ms_clientes_cluster.id
  task_definition = aws_ecs_task_definition.ms_clientes_task.arn
  desired_count   = 1
  launch_type     = "EC2"

  tags = {
    Name        = "ms_Clientes-ECS-Service"
    Application = "FIAP-TechChallenge"
  }
}