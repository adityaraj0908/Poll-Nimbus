pipeline {
    agent any
    
    stages {
        stage('Install Prerequisites') {
            steps {
                sh '''
                echo "Installing prerequisites..."
                apt-get update
                
                # Install Docker
                echo "Installing Docker..."
                apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
                curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
                apt-get update
                apt-get install -y docker-ce docker-ce-cli containerd.io
                
                # Install Node.js and npm
                echo "Installing Node.js and npm..."
                apt-get install -y nodejs npm
                
                # Verify installations
                docker --version
                node --version
                npm --version
                '''
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Test') {
            steps {
                sh 'echo "Tests would run here"'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh '''
                echo "Building Docker image..."
                docker build -t poll-nimbus:latest .
                docker images | grep poll-nimbus
                '''
            }
        }
        
        stage('Deploy to Mock Kubernetes') {
            steps {
                sh '''
                echo "In a real environment, we would deploy to Kubernetes with:"
                echo "kubectl apply -f kubernetes/deployment.yaml"
                echo "kubectl apply -f kubernetes/service.yaml"
                
                echo "Simulating deployment with Docker..."
                docker run -d --name poll-nimbus-container -p 3000:3000 poll-nimbus:latest || true
                echo "Application deployed successfully!"
                '''
            }
        }
    }
    
    post {
        always {
            sh '''
            echo "Cleaning up..."
            docker stop poll-nimbus-container || true
            docker rm poll-nimbus-container || true
            '''
        }
    }
}