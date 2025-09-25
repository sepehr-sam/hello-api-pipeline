pipeline {
  agent any

  tools { nodejs 'node18' }   // Manage Jenkins > Global Tool Config > NodeJS named node18

  environment {
    // If you deploy to same box as Jenkins:
    TEST_DIR = 'C:\\apps\\hello-api-test'
    PROD_DIR = 'C:\\apps\\hello-api-prod'
    TEST_URL = 'http://localhost:3000/hello'
    PROD_URL = 'http://localhost:3001/hello'
    // Optional webhook for alerts (Teams/Slack/etc). Leave empty if you don’t have one.
    MONITOR_WEBHOOK = credentials('monitor-webhook-url') // or remove this line if not set
  }

  options { timestamps(); ansiColor('xterm') }

  stages {

    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build (create artefact)') {
      steps {
        sh 'node -v && npm -v'
        sh 'npm ci || npm install'
        sh 'bash build.sh || ./build.sh || powershell -NoProfile -Command "Compress-Archive -Force * hello-api-artifact.zip"'
        archiveArtifacts artifacts: 'hello-api-artifact.zip', fingerprint: true
      }
    }

    stage('Test (automated)') {
      steps {
        sh 'npm test'
      }
      post {
        always {
          // If you switch to a real test runner that exports JUnit XML, collect it here
          echo 'Tests finished.'
        }
      }
    }

    stage('Code Quality (SonarQube)') {
      steps {
        script {
          try {
            withSonarQubeEnv('sonarqube') {
              sh 'sonar-scanner || true'
            }
          } catch (err) {
            echo "SonarQube not configured; continuing."
          }
        }
      }
    }

    stage('Security (npm audit + optional Snyk)') {
      steps {
        script {
          sh '''
            set -e
            echo "# Security Scan Summary" > security-summary.md
            echo "## npm audit (high+)" >> security-summary.md
            npm audit --audit-level=high || true >> security-summary.md 2>&1
            echo "\\n---\\n" >> security-summary.md
            if command -v snyk >/dev/null 2>&1; then
              echo "## Snyk test" >> security-summary.md
              snyk auth "${SNYK_TOKEN}" >/dev/null 2>&1 || true
              snyk test || true >> security-summary.md 2>&1
            else
              echo "Snyk not installed; skipped." >> security-summary.md
            fi
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'security-summary.md', fingerprint: true
        }
      }
    }

    stage('Deploy to TEST') {
      steps {
        script {
          // Extract artefact to TEST_DIR and start on port 3000
          if (isUnix()) {
            sh '''
              rm -rf "${TEST_DIR}" || true
              mkdir -p "${TEST_DIR}"
              unzip -o hello-api-artifact.zip -d "${TEST_DIR}"
              pkill -f "node .*app.js.*3000" || true
              nohup env PORT=3000 node "${TEST_DIR}/app.js" > "${TEST_DIR}/app.log" 2>&1 &
              sleep 2
            '''
          } else {
            bat """
              if not exist "%TEST_DIR%" mkdir "%TEST_DIR%"
              powershell -NoProfile -Command "Expand-Archive -Force hello-api-artifact.zip '%TEST_DIR%'"
              for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /PID %%p /F
              start /B cmd /c "set PORT=3000 && node \"%TEST_DIR%\\app.js\" > \"%TEST_DIR%\\app.log\" 2>&1"
              ping -n 3 127.0.0.1 >NUL
            """
          }
        }
      }
    }

    stage('Smoke test (TEST)') {
      steps {
        sh "curl -fsS '${TEST_URL}' > /dev/null"
      }
    }

    stage('Release gate') {
      when { expression { return env.CHANGE_ID == null } } // skip on PRs
      steps {
        input message: 'Promote to PRODUCTION?', ok: 'Release'
      }
    }

    stage('Deploy to PROD') {
      when { expression { return env.CHANGE_ID == null } }
      steps {
        script {
          if (isUnix()) {
            sh '''
              rm -rf "${PROD_DIR}" || true
              mkdir -p "${PROD_DIR}"
              unzip -o hello-api-artifact.zip -d "${PROD_DIR}"
              pkill -f "node .*app.js.*3001" || true
              nohup env PORT=3001 node "${PROD_DIR}/app.js" > "${PROD_DIR}/app.log" 2>&1 &
              sleep 2
            '''
          } else {
            bat """
              if not exist "%PROD_DIR%" mkdir "%PROD_DIR%"
              powershell -NoProfile -Command "Expand-Archive -Force hello-api-artifact.zip '%PROD_DIR%'"
              for /f "tokens=5" %%p in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do taskkill /PID %%p /F
              start /B cmd /c "set PORT=3001 && node \"%PROD_DIR%\\app.js\" > \"%PROD_DIR%\\app.log\" 2>&1"
              ping -n 3 127.0.0.1 >NUL
            """
          }
        }
      }
    }

    stage('Monitoring & Alerting (PROD)') {
      steps {
        script {
          try {
            sh "curl -fsS '${PROD_URL}' > /dev/null"
            echo "Monitoring OK"
          } catch (e) {
            echo "Monitoring FAILED"
            // Optional alert webhook if configured
            script {
              try {
                sh '''
                  if [ -n "${MONITOR_WEBHOOK}" ]; then
                    curl -X POST -H "Content-Type: application/json" \
                      -d "{\\"text\\": \\"hello-api PROD health check FAILED\\"}" \
                      "${MONITOR_WEBHOOK}" || true
                  fi
                '''
              } catch (ignore) { echo "Alert webhook not configured." }
            }
            error("Prod health check failed")
          }
        }
      }
    }
  }

  post {
    success { echo 'All stages passed. Go bask in that green glow.' }
    failure { echo 'Pipeline failed. Read logs. Fix. Commit. Try again.' }
  }
}
