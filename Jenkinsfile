pipeline {
    agent any
    environment {
        REGISTRY     = 'ghcr.io'
        IMAGE_PREFIX = '2410994840/telecare'
    }
    stages {
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
                        }}}}}
        stage('Test') {
            steps {
                echo 'Running tests (dummy)'
            }}
        stage('Code Quality') {
            steps {
                dir('frontend') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    sh """
                    npx sonar-scanner \
                    -Dsonar.projectKey=telecare \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=http://localhost:9000 \
                    -Dsonar.login=$SONAR_TOKEN
    """
}}}}
        stage('Security Scan') {
            steps {
                script {
                    def GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    ['backend', 'frontend', 'ai-service'].each { svc ->
                        def image = "ghcr.io/2410994840/telecare-${svc}:${GIT_SHA}"
                        sh """
                        echo "Scanning ${image}"
                        trivy image --severity HIGH,CRITICAL --no-progress --exit-code 0 ${image}
                        """}}}}
        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'hiemysecret08', variable: 'JWT_SECRET'),
                    string(credentialsId: 'hiemysecret0808', variable: 'AES_SECRET')
                ]) {
                    script {
                        sh '''
                        echo "Cleaning ports..."

                        docker ps -q --filter "publish=5000" | xargs -r docker stop
                        docker ps -q --filter "publish=5001" | xargs -r docker stop
                            echo "Stopping old containers..."
                            docker-compose down || true
                            echo "Cleaning old containers..."

                            docker rm -f telecare-ai telecare-mongo telecare-backend telecare-frontend telecare-grafana telecare-prometheus || true

                            docker-compose down --remove-orphans
                            echo "Deploying application..."
                            docker-compose up -d --build

                            echo "DEPLOYMENT DONE "
                        '''
            
                    }}}}
    stage('Release') {
    steps {
        echo "Promoting application to Production..."

        sh '''
        echo "Stopping existing production containers..."
        docker-compose down || true

        echo "Deploying to production environment..."
        docker-compose -f docker-compose.yml up -d

        echo "Release completed successfully!"
        '''
    }
}
    stage('Monitoring & Alerting') {
    steps {
        script {
            def status = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000', returnStdout: true).trim()

            if (status != "200") {
                echo "ALERT: Backend is DOWN!"
                error("Stopping pipeline due to failure")
            } else {
                echo "Backend is healthy"
            }
        }
    }
}}}
