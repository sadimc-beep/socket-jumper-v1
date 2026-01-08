/// <reference types="nativewind/types" />
import "react-native";

declare module "react-native" {
    interface ViewProps {
        className?: string;
    }
    interface TextProps {
        className?: string;
    }
    interface ImageProps {
        className?: string;
    }
    interface ScrollViewProps {
        className?: string;
    }
    interface TextInputProps {
        className?: string;
    }
    interface TouchableOpacityProps {
        className?: string;
    }
    interface ActivityIndicatorProps {
        className?: string;
    }
    interface SwitchProps {
        className?: string;
    }
    interface KeyboardAvoidingViewProps {
        className?: string;
    }
}

declare module 'expo-linear-gradient' {
    interface LinearGradientProps {
        className?: string;
    }
}

declare module 'react-native-safe-area-context' {
    interface NativeSafeAreaViewProps {
        className?: string;
    }
}
