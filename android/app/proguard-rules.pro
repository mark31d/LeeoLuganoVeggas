# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }
-keep class com.facebook.soloader.** { *; }
-keep class com.facebook.react.soloader.** { *; }

# --- devsupport (фикс твоего краша) ---
-keep class com.facebook.react.devsupport.** { *; }
-keep class com.facebook.react.packagerconnection.** { *; }

# Fresco / Images
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.common.** { *; }

# ExoPlayer (если используешь react-native-video)
-keep class com.google.android.exoplayer2.** { *; }

# OkHttp / Okio (если есть)
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# --- DoNotStrip (бывает в двух пакетах) ---
-keep class com.facebook.proguard.annotations.DoNotStrip { *; }
-keep class com.facebook.proguard.annotations.DoNotStrip$* { *; }
-keep class com.facebook.common.proguard.annotations.DoNotStrip { *; }
-keep class com.facebook.common.proguard.annotations.DoNotStrip$* { *; }
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.common.proguard.annotations.DoNotStrip *;
}

# Молчим о предупреждениях по аннотациям
-dontwarn com.facebook.proguard.annotations.**
-dontwarn com.facebook.common.proguard.annotations.**
-dontwarn com.facebook.infer.annotation.**