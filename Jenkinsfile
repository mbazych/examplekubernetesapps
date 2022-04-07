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

		stage('Test application') {
			steps {
				dir('express_app/') {
					sh 'docker-compose up --build -d'
				
					sh 'sleep 10'
					sh 'npm install'
					sh 'mocha src/tests/postgres-item.js'
				}
			}
		}

		stage('Build docker image') {

			steps {
				sh 'docker build -t $DOCKER_REPO:$BUILD_ID $DOCKERFILE_DIR'
			}
		}

		stage('Docker login') {

			steps {
				sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
			}
		}

		stage('Push to docker hub') {

			steps {
			    sh 'docker push $DOCKER_REPO:$BUILD_ID'
				sh 'docker tag $DOCKER_REPO:$BUILD_ID $DOCKER_REPO:latest'
				sh 'docker push $DOCKER_REPO:latest'
			}
		}
		stage('Deploy to stage environment') {
            when {
                expression { env.BRANCH_NAME == 'stage' }
            }
		    steps {
		        withCredentials([file(credentialsId: 'kube-config', variable: 'CONFIG')]) {
					sh 'mkdir -p ~/.kube'
					sh 'cp $CONFIG ~/.kube/config'
					sh 'chmod 600 ~/.kube/config'
					sh 'kubectl config use-context $CONTEXT_NAME'
					sh 'helm upgrade --install --namespace $STAGE_NAMESPACE $CHART_NAME $CHART_DIR -f $CHART_DIR/values.yaml --set "ingress.hosts[0].host=stage-express-app-rsq.mbazych.pl"'
				}
			}
		}

		stage('Deploy to production environment') {
            when {
                expression { env.BRANCH_NAME == 'main' }
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