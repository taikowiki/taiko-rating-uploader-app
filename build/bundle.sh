rm -f ./build/android/bundle.apks
java -jar ./android/bundletool.jar build-apks --bundle=./android/app/build/outputs/bundle/release/app-release-signed.aab --output ./build/android/bundle.apks --mode=universal;
unzip -o ./build/android/bundle.apks -d ./build/android