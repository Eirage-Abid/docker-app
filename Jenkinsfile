pipeline {
    agent any

    environment {
        // Change these to match your registry / Docker Hub username
        IMAGE_NAME = "yourdockerhubuser/docker-demo-app"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
        REGISTRY_CREDENTIALS = credentials('dockerhub-credentials') // set up in Jenkins Credentials
    }

    stages {
        stage('Checkout') {
            steps {
                // Pulls the latest commit that triggered this build
                checkout scm
            }
        }

        stage('Build custom image') {
            steps {
                // This is the "builds JS app & creates docker image" step from the diagram
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Login to registry') {
            steps {
                sh "echo ${REGISTRY_CREDENTIALS_PSW} | docker login -u ${REGISTRY_CREDENTIALS_USR} --password-stdin"
            }
        }

        stage('Push custom image') {
            steps {
                // This is the "push" arrow to the Docker Repository in the diagram
                sh "docker push ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker push ${IMAGE_NAME}:latest"
            }
        }
    }

    post {
        always {
            sh "docker logout"
        }
    }
}
