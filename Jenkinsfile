pipeline {
    agent any

    environment {
        REGISTRY     = 'ghcr.io'
        IMAGE_PREFIX = '2410994840/telecare'
        GIT_SHA      = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
    }

    stages {
        stage('Build') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'muskan',
                    usernameVariable: '2410994840',
                    passwordVariable: 'muskan080808'
                )]) {
                    sh 'echo $GHCR_TOKEN | docker login $REGISTRY -u $GHCR_USER --password-stdin'

                    script {
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
    }
}
