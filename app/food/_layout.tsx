import { Stack } from "expo-router";
import { FoodOrderProvider } from "@/components/providers/FoodOrderProvider";

export default function FoodLayout() {
  return (
    <FoodOrderProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FoodOrderProvider>
  );
}
