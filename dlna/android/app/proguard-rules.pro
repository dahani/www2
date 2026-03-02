# Please add these rules to your existing keep rules in order to suppress warnings.
# This is generated automatically by the Android Gradle plugin.
-dontwarn org.osgi.service.component.annotations.Component
-dontwarn org.osgi.service.metatype.annotations.Designate
-keep class org.fourthline.cling.** { *; }
-keep class * implements org.fourthline.cling.** { *; }
-keep class com.example.mediacastdlna.** { *; }
-keepattributes *Annotation*
