pipeline {
    agent any

    environment {
        REGISTRY     = 'ghcr.io'
        IMAGE_PREFIX = '2410994840/telecare'
    }

    stages {

        // ---------------- BUILD ----------------
        stage('Build') {
            steps {
                script {
                    def GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()

                    withCredentials([usernamePassword(
                        credentialsId: '208',
                        usernameVariable: 'GHCR_USER',
                        passwordVariable: 'GHCR_TOKEN'
                    )]) {

                        sh 'echo $GHCR_TOKEN | docker login $REGISTRY -u $GHCR_USER --password-stdin'

                        ['backend', 'frontend', 'ai-service'].each { svc ->
                            def tag = "${REGISTRY}/${IMAGE_PREFIX}-${svc}"

                            sh """
                                docker build -t ${tag}:${GIT_SHA} -t ${tag}:latest ./${svc}
                                docker push ${tag}:${GIT_SHA}
                                docker push ${tag}:latest
                            """
                        }
                    }
                }
            }
        }

        // ---------------- TEST ----------------
        stage('Test') {
            steps {
                echo 'Running tests (dummy)'
            }
        }

        // ---------------- CODE QUALITY ----------------
        stage('Code Quality') {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    dir('frontend') {
                        sh '''
                        npx sonar-scanner \
                          -Dsonar.projectKey=telecare \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://localhost:9000 \
                          -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        // ---------------- SECURITY ----------------
        stage('Security Scan') {
            steps {
                script {
                    def GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()

                    ['backend', 'frontend', 'ai-service'].each { svc ->
                        def image = "ghcr.io/2410994840/telecare-${svc}:${GIT_SHA}"

                        sh """
                        echo "Scanning ${image}"
                        trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${image}
                        """
                    }
                }
            }
        }

        // ---------------- DEPLOY ----------------
        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'hiemysecret08', variable: 'JWT_SECRET'),
                    string(credentialsId: 'hiemysecret0808', variable: 'AES_SECRET')
                ]) {
                    sh '''
                        echo "Stopping old containers..."
                        docker-compose down || true

                        echo "Pulling latest images..."
                        docker-compose pull

                        echo "Starting containers..."
                        docker-compose up -d
                    '''
                }
            }
        }
    }
}