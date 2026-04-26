import * as Haptics from "expo-haptics";
import { Pressable, Text, ActivityIndicator, View, type PressableProps } from "react-native";
import { theme } from "@/lib/theme";

type Props = PressableProps & {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  haptic?: boolean;
};

export function Button({
  label,
  variant = "primary",
  loading,
  haptic = true,
  onPress,
  ...rest
}: Props) {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  return (
    <Pressable
      {...rest}
      onPress={(e) => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      style={({ pressed }) => ({
        opacity: pressed ? 0.85 : 1,
        backgroundColor: isPrimary
          ? theme.colors.accent
          : isSecondary
          ? theme.colors.cardElevated
          : "transparent",
        borderWidth: 1.5,
        borderColor: isPrimary ? theme.colors.accent : theme.colors.border,
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 52,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? theme.colors.bg : theme.colors.text} size="small" />
        ) : null}
        <Text
          style={{
            color: isPrimary ? theme.colors.bg : theme.colors.text,
            fontWeight: "900",
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
