pipeline{

	agent any

	environment {
		DOCKERHUB_CREDENTIALS=credentials('docker-hub')
		DOCKERFILE_DIR='express_app/'
		DOCKER_REPO='mbazych/rsq'
	}

	stages {

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
	}

	post {
		always {
			sh 'docker logout'
		}
	}

}