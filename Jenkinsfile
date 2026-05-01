pipeline {
    agent any
    environment {
        REGISTRY     = 'ghcr.io'
        IMAGE_PREFIX = '2410994840/telecare'}
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
                            """}}}}}
        stage('Test') {
            steps {
                echo 'Running tests (dummy)'}}
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
        stage('Deploy (Staging)') {
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
                        docker-compose down || true
                        docker rm -f telecare-ai telecare-mongo telecare-backend telecare-frontend telecare-grafana telecare-prometheus || true
                        docker-compose down --remove-orphans
                        docker-compose up -d --build
                        echo "STAGING DEPLOYMENT DONE"
                        '''}}}}
        stage('Release (Production - Octopus)') {
            steps {
                echo "Releasing via Octopus Deploy..."
                withCredentials([
                    string(credentialsId: 'octopus-api-key', variable: 'OCTO_API_KEY'),
                    string(credentialsId: 'octopus-server-url', variable: 'OCTO_SERVER')
                ]) {
                    script {
                        def GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                        sh """
                        echo "Creating release ${GIT_SHA}..."
                        octo create-release \
                          --project="Telecare Project" \
                          --version=${GIT_SHA} \
                          --server=$OCTO_SERVER \
                          --apiKey=$OCTO_API_KEY
                        echo "Deploying release to Production..."
                        octo deploy-release \
                          --project="Telecare Project" \
                          --version=${GIT_SHA} \
                          --environment="Production" \
                          --server=$OCTO_SERVER \
                          --apiKey=$OCTO_API_KEY \
                          --waitForDeployment
                        """}}}}
        stage('Monitoring & Alerting') {
            steps {
                script {
                    sh 'sleep 10'
                    def backend = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo 000', returnStdout: true).trim()
                    def prometheus = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:9090 || echo 000', returnStdout: true).trim()
                    def grafana = sh(script: 'curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo 000', returnStdout: true).trim()
                    if (backend != "200") {
                        echo "ALERT: Backend DOWN"}
                    if (prometheus != "200") {
                        echo "ALERT: Prometheus DOWN"}
                    if (grafana != "200") {
                        echo "ALERT: Grafana DOWN"}
                    if (backend == "200" && prometheus == "200" && grafana == "200") {
                        echo "All systems healthy"
                    }}}}}
    post {
        success {
            emailext(
                to: 'muskan4840.se24@chitkara.edu.in',
                subject: "SUCCESS: Telecare Build #${BUILD_NUMBER}",
                body: """
                Build Successful!
                Project: ${JOB_NAME}
                Build Number: ${BUILD_NUMBER}
                All stages including Release (Octopus) executed successfully.
                """,
                attachLog: true)}
        failure {
            emailext(
                to: 'muskan4840.se24@chitkara.edu.in',
                subject: "FAILED: Telecare Build #${BUILD_NUMBER}",
                body: """
                Build Failed!
                Project: ${JOB_NAME}
                Build Number: ${BUILD_NUMBER}
                Please check Jenkins logs.
                """,
                attachLog: true)
        }
    }
}
