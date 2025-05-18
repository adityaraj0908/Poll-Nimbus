pipeline {
    agent any

    environment {
        IMAGE_NAME = "poll-nimbus"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    tools {
        nodejs 'NodeJS 18' // Jenkins tool name (configure in Jenkins Global Tools)
    }

    stages {
        stage('Install Prerequisites') {
            steps {
                echo 'Installing prerequisites...'
                sh '''
                set -e
                sudo apt-get update
                sudo apt-get install -y docker.io || true
                sudo systemctl start docker || true
                sudo systemctl enable docker || true
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm packages...'
                sh '''
                set -e
                npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh '''
                set -e
                npm test
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                sh '''
                set -e
                sudo docker build -t ${IMAGE_NAME}:latest .
                sudo docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push to Docker Registry') {
            when {
                expression { return env.DOCKER_USERNAME && env.DOCKER_PASSWORD }
            }
            steps {
                echo 'Pushing Docker image to registry...'
                withCredentials([usernamePassword(credentialsId: 'docker-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    sh '''
                    set -e
                    echo "$DOCKER_PASSWORD" | sudo docker login -u "$DOCKER_USERNAME" --password-stdin
                    sudo docker tag ${IMAGE_NAME}:${IMAGE_TAG} $DOCKER_USERNAME/${IMAGE_NAME}:${IMAGE_TAG}
                    sudo docker push $DOCKER_USERNAME/${IMAGE_NAME}:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                    set -e
                    kubectl apply -f kubernetes/deployment.yaml
                    kubectl apply -f kubernetes/service.yaml
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker containers...'
            sh '''
            sudo docker stop poll-nimbus-container || true
            sudo docker rm poll-nimbus-container || true
            '''
            cleanWs()
        }
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs for errors.'
        }
    }
}
