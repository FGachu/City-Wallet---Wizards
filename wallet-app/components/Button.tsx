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
        borderWidth: variant === "ghost" ? 1 : 0,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.full,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 50,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {loading ? (
          <ActivityIndicator color={isPrimary ? "#0B0B0F" : theme.colors.text} size="small" />
        ) : null}
        <Text
          style={{
            color: isPrimary ? "#0B0B0F" : theme.colors.text,
            fontWeight: "700",
            fontSize: 15,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
