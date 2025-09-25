pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm install'   // not really needed but shows a build step
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    stage('Code Quality') {
      steps {
        sh 'echo "Pretend SonarQube ran here"'
      }
    }
    stage('Security') {
      steps {
        sh 'npm audit --audit-level=high || true'
      }
    }
    stage('Deploy') {
      steps {
        sh '''
          pkill -f "node app.js" || true
          nohup node app.js > app.log 2>&1 &
        '''
      }
    }
    stage('Monitoring') {
      steps {
        sh 'curl -f http://localhost:3000/hello'
      }
    }
  }
}
