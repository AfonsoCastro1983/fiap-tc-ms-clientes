# Provedor AWS
provider "aws" {
  region = "us-east-2"
}

# Criar VPC
resource "aws_vpc" "ms_clientes_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

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

# Associação da Tabela de Roteamento às Subnets
resource "aws_route_table_association" "ms_clientes_public_route_association_1" {
  subnet_id      = aws_subnet.ms_clientes_public_subnet.id
  route_table_id = aws_route_table.ms_clientes_public_route_table.id
}

resource "aws_route_table_association" "ms_clientes_public_route_association_2" {
  subnet_id      = aws_subnet.ms_clientes_public_subnet_2.id
  route_table_id = aws_route_table.ms_clientes_public_route_table.id
}

# Security Group para ALB
resource "aws_security_group" "ms_clientes_alb_sg" {
  name        = "ms_clientes_alb_sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.ms_clientes_vpc.id

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
    Name        = "ms_Clientes-ALB-SG"
    Application = "FIAP-TechChallenge"
  }
}

# Security Group para ECS
resource "aws_security_group" "ms_clientes_ecs_sg" {
  name        = "ms_clientes_ecs_sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.ms_clientes_vpc.id

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.ms_clientes_alb_sg.id]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port       = 32768
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.ms_clientes_alb_sg.id]
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

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ms_clientes_logs" {
  name              = "/ecs/ms-clientes"
  retention_in_days = 30

  tags = {
    Application = "FIAP-TechChallenge"
    Name        = "ms_Clientes-Logs"
  }
}

# Load Balancer
resource "aws_lb" "ms_clientes_ecs_lb" {
  name               = "ms-clientes-ecs-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.ms_clientes_alb_sg.id]
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
    type             = "forward"
    target_group_arn = aws_lb_target_group.ms_clientes_ecs_target_group.arn
  }
}

# Target Group
resource "aws_lb_target_group" "ms_clientes_ecs_target_group" {
  name        = "ms-clientes-ecs-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.ms_clientes_vpc.id
  target_type = "ip"

  health_check {
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200-299"
  }

  tags = {
    Name        = "ms_clientes_ecs_target_group"
    Application = "FIAP-TechChallenge"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "ms_clientes_cluster" {
  name = "ms_Clientes-ECS-Cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "ms_Clientes-ECS-Cluster"
    Application = "FIAP-TechChallenge"
  }
}

# IAM Role para o ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ms_clientes_ecs_task_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

# Anexar política para ECS Task Execution Role
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "ms_clientes_task" {
  family                   = "ms_Clientes-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "2048"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "fiap-msclientes-app"
    image     = "992382363343.dkr.ecr.us-east-2.amazonaws.com/ms-clientes:latest"
    essential = true
    
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
      protocol      = "tcp"
    }]

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

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ms_clientes_logs.name
        "awslogs-region"        = "us-east-2"
        "awslogs-stream-prefix" = "ecs"
      }
    }
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
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.ms_clientes_public_subnet.id, aws_subnet.ms_clientes_public_subnet_2.id]
    security_groups  = [aws_security_group.ms_clientes_ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ms_clientes_ecs_target_group.arn
    container_name   = "fiap-msclientes-app"
    container_port   = 8000
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  tags = {
    Name        = "ms_Clientes-ECS-Service"
    Application = "FIAP-TechChallenge"
  }
}