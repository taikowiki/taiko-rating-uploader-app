npx cap build --keystorepath keystore.jks --keystorepass spasname0! --keystorealias taikowiki-rating-upload-key-1 --keystorealiaspass spasname0! android  
rm -f ./build/android/bundle.apks
java -jar ./android/bundletool.jar build-apks --bundle=./android/app/build/outputs/bundle/release/app-release-signed.aab --output ./build/android/bundle.apks --mode=universal;
unzip -o ./build/android/bundle.apks -d ./build/android