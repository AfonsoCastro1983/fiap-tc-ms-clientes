# Provedor AWS
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
resource "aws_subnet" "ms_clientes_public_subnet" {
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
resource "aws_route_table" "ms_clientes_public_route_table" {
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
resource "aws_route_table_association" "ms_clientes_public_route_association" {
  subnet_id      = aws_subnet.ms_clientes_public_subnet.id
  route_table_id = aws_route_table.ms_clientes_public_route_table.id
}

# Security Group
resource "aws_security_group" "ms_clientes_ecs_sg" {
  vpc_id = aws_vpc.ms_clientes_vpc.id

  ingress {
    from_port   = 8000
    to_port     = 8000
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

# Subnet pública adicional
resource "aws_subnet" "ms_clientes_public_subnet_2" {
  vpc_id                  = aws_vpc.ms_clientes_vpc.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-2b"

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_Clientes-ECS-Public-Subnet-2"
  }
}

# Load Balancer
resource "aws_lb" "ms_clientes_ecs_lb" {
  name               = "ms-clientes-ecs-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ms_clientes_ecs_sg.id]
  subnets            = [
    aws_subnet.ms_clientes_public_subnet.id,
    aws_subnet.ms_clientes_public_subnet_2.id
  ]

  tags = {
    Name        = "ms_clientes_ecs_lb"
    Application = "FIAP-TechChallenge"
  }
}

# Listener do Load Balancer
resource "aws_lb_listener" "ms_clientes_ecs_lb_listener" {
  load_balancer_arn = aws_lb.ms_clientes_ecs_lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.ms_clientes_ecs_target_group.arn
  }
}

# Target Group
resource "aws_lb_target_group" "ms_clientes_ecs_target_group" {
  name        = "ms-clientes-ecs-target-group"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.ms_clientes_vpc.id
  target_type = "instance"

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    matcher             = "200"
  }

  tags = {
    Name        = "ms_clientes_ecs_target_group"
    Application = "FIAP-TechChallenge"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "ms_clientes_cluster" {
  name = "ms_Clientes-ECS-Cluster"

  tags = {
    Name        = "ms_Clientes-ECS-Cluster"
    Application = "FIAP-TechChallenge"
  }
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ms_clientes_task" {
  family                   = "ms_Clientes-task"
  network_mode             = "bridge"
  requires_compatibilities = ["EC2"]
  cpu                      = "1024" # 1 vCPU
  memory                   = "2048" # 2 GB RAM

  container_definitions = jsonencode([{
    name      = "fiap-msclientes-app"
    image     = "992382363343.dkr.ecr.us-east-2.amazonaws.com/ms-clientes:latest"
    essential = true
    portMappings = [
      {
        containerPort = 8000
        hostPort      = 8000
        protocol      = "tcp"
      }
    ]
    environment = [
      {
        name  = "MODE"
        value = "Máquina local"
      },
      {
        name  = "TYPEORM_HOST"
        value = "fiap-ms-cliente.c9qyy4w40svf.us-east-2.rds.amazonaws.com"
      },
      {
        name  = "TYPEORM_USERNAME"
        value = var.db_user
      },
      {
        name  = "TYPEORM_PASS"
        value = var.db_password
      },
      {
        name  = "TYPEORM_DATABASE"
        value = "lanchonete"
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

  load_balancer {
    target_group_arn = aws_lb_target_group.ms_clientes_ecs_target_group.arn
    container_name   = "fiap-msclientes-app"
    container_port   = 8000
  }

  tags = {
    Name        = "ms_Clientes-ECS-Service"
    Application = "FIAP-TechChallenge"
  }
}

# Launch Configuration
resource "aws_launch_configuration" "ecs_launch_config" {
  name          = "ms-clientes-launch-config"
  image_id      = "ami-0c02fb55956c7d316" # Substitua pela AMI ECS otimizada
  instance_type = "t3.medium" # Aumentado para 2 vCPUs e 4 GB RAM
  iam_instance_profile = aws_iam_instance_profile.ecs_instance_profile.name
  security_groups = [aws_security_group.ms_clientes_ecs_sg.id]

  user_data = <<-EOF
  #!/bin/bash
  echo ECS_CLUSTER=${aws_ecs_cluster.ms_clientes_cluster.name} >> /etc/ecs/ecs.config
  EOF
}

# Auto Scaling Group
resource "aws_autoscaling_group" "ecs_asg" {
  launch_configuration = aws_launch_configuration.ecs_launch_config.id
  min_size             = 1
  max_size             = 3
  desired_capacity     = 1
  vpc_zone_identifier  = [
    aws_subnet.ms_clientes_public_subnet.id,
    aws_subnet.ms_clientes_public_subnet_2.id
  ]

  tags = [
    {
      key                 = "Name"
      value               = "ms-clientes-ecs-instance"
      propagate_at_launch = true
    }
  ]
}

# IAM Role para ECS
resource "aws_iam_role" "ecs_instance_role" {
  name = "ecs_instance_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# Política de ECS para EC2
resource "aws_iam_policy_attachment" "ecs_instance_policy" {
  name       = "ecs_instance_policy_attachment"
  roles      = [aws_iam_role.ecs_instance_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

# Instance Profile
resource "aws_iam_instance_profile" "ecs_instance_profile" {
  name = "ecs_instance_profile"
  role = aws_iam_role.ecs_instance_role.name
}