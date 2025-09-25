# build.ps1
if (Test-Path hello-api-artifact.zip) { Remove-Item hello-api-artifact.zip -Force }
Compress-Archive -Path * -CompressionLevel Optimal -DestinationPath hello-api-artifact.zip -Force -Exclude node_modules,*.zip,.git
