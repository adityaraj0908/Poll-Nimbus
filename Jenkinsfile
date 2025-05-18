pipeline {
    agent any

    environment {
        IMAGE_NAME = "poll-nimbus"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    tools {
        nodejs 'NodeJS 18' // Ensure this tool is configured in Jenkins
    }

    stages {
        stage('Install Prerequisites') {
            steps {
                echo 'Installing prerequisites...'
                sh '''
                set -e
                apt-get update
                apt-get install -y docker.io || true
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
                docker build -t ${IMAGE_NAME}:latest .
                docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${IMAGE_TAG}
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
                    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} $DOCKER_USERNAME/${IMAGE_NAME}:${IMAGE_TAG}
                    docker push $DOCKER_USERNAME/${IMAGE_NAME}:${IMAGE_TAG}
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
            docker stop poll-nimbus-container || true
            docker rm poll-nimbus-container || true
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
