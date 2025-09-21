import React, { useState } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { sendEmbedding } from "../lib/api";

export default function PredictScreen() {
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<{hb_pred:number; is_anemic:0|1} | null>(null);

  const onPress = async () => {
    setLoading(true);
    try {
      // TODO: replace with real 512-D embedding from our RN embedding code
      const embedding = Array(512).fill(0).map((_,i)=>Math.sin(i));
      const json = await sendEmbedding(embedding);
      setRes(json);
    } catch (error) {
      console.error("Prediction error:", error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Button title="Send embedding → predict" onPress={onPress} />
      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {res && (
        <Text style={{ marginTop: 12 }}>
          Hb: {res.hb_pred.toFixed(2)} g/dL{"\n"}
          {res.is_anemic ? "⚠️ Likely anemic" : "✅ Normal"}
        </Text>
      )}
    </View>
  );
}
