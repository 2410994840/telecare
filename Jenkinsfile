pipeline {
    agent any

    environment {
        PATH = "/opt/homebrew/bin/sonar-scanner"
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
                // later you can add npm test here
            }
        }

        // ---------------- CODE QUALITY ----------------
        stage('Code Quality') {
            steps {
                dir('frontend') {
                    sh '''
                    npx sonar-scanner \
                      -Dsonar.projectKey=telecare \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=http://localhost:9000 \
                      -Dsonar.login=YOUR_TOKEN
                    '''
                }
            }
        }
    }
}