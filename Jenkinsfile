pipeline{

	agent any

	environment {
		DOCKERHUB_CREDENTIALS=credentials('docker-hub')
		DOCKERFILE_DIR='express_app/'
		DOCKER_REPO='mbazych/rsq'
		CONTEXT_NAME='mbazych@foodash-cluster'
		PROD_NAMESPACE='rsq'
		STAGE_NAMESPACE='rsq-stage'
		CHART_NAME='rsq'
		CHART_DIR='Helm/express_app/express_app/'
		TEST_HOST='172.22.0.1:8090'
	}

	stages {

		stage('Test') {
			steps {
				dir('express_app/') {
					sh 'docker-compose up --build -d'
				
					sh 'sleep 10'
					sh 'npm install'
					sh 'mocha src/tests/postgres-item.js'
				}
			}
		}

		stage('Build') {

			steps {
				sh 'docker build -t $DOCKER_REPO:$BUILD_ID $DOCKERFILE_DIR'
			}
		}

		stage('Login') {

			steps {
				sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
			}
		}

		stage('Push') {

			steps {
			    sh 'docker push $DOCKER_REPO:$BUILD_ID'
				sh 'docker tag $DOCKER_REPO:$BUILD_ID $DOCKER_REPO:latest'
				sh 'docker push $DOCKER_REPO:latest'
			}
		}
		stage('Deploy to stage environment') {
			when {
				branch "stage"
			}
		    steps {
		        withCredentials([file(credentialsId: 'kube-config', variable: 'CONFIG')]) {
					sh 'mkdir -p ~/.kube'
					sh 'cp $CONFIG ~/.kube/config'
					sh 'chmod 600 ~/.kube/config'
					sh 'kubectl config use-context $CONTEXT_NAME'
					sh 'helm upgrade --install --namespace $STAGE_NAMESPACE $CHART_NAME $CHART_DIR'
				}
			}
		}

		stage('Deploy to production environment') {
		    when {
				branch "main"
			}
		    steps {
		        withCredentials([file(credentialsId: 'kube-config', variable: 'CONFIG')]) {
					sh 'mkdir -p ~/.kube'
					sh 'cp $CONFIG ~/.kube/config'
					sh 'chmod 600 ~/.kube/config'
					sh 'kubectl config use-context $CONTEXT_NAME'
					sh 'helm upgrade --install --namespace $PROD_NAMESPACE $CHART_NAME $CHART_DIR'
				}
			}
		}
	}

	post {
		always {
			sh 'docker logout'
			dir('express_app/') {
				sh 'docker-compose down --rmi all'
			}
		}
	}

}