
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { pipeline } from "@huggingface/transformers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  const [text, setText] = useState("");
  const [sentiment, setSentiment] = useState<any>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const analyzeSentiment = async () => {
    if (!text) return;
    setIsAnalyzing(true);
    try {
      const classifier = await pipeline(
        "sentiment-analysis",
        "Xenova/distilbert-base-uncased-finetuned-sst-2-english"
      );
      const result = await classifier(text);
      setSentiment(result[0]);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
    }
    setIsAnalyzing(false);
  };

  const translateText = async () => {
    if (!text) return;
    setIsTranslating(true);
    try {
      const translator = await pipeline(
        "translation",
        "Xenova/nllb-200-distilled-600M"
      );
      const result = await translator(text, {
        src_lang: "eng_Latn",
        tgt_lang: targetLanguage === "es" ? "spa_Latn" : "fra_Latn",
      });
      setTranslatedText(result[0].translation_text);
    } catch (error) {
      console.error("Error translating text:", error);
    }
    setIsTranslating(false);
  };

  const getSentimentColor = () => {
    if (!sentiment) return "bg-gray-100";
    return sentiment.label === "POSITIVE"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Analysis Tool
          </Badge>
          <h1 className="text-4xl font-light tracking-tight text-gray-900">
            Sentiment & Translation
          </h1>
          <p className="text-gray-500">
            Analyze sentiment and translate text with advanced AI
          </p>
        </div>

        <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
          <div className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              className="min-h-[120px] resize-none bg-white"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={analyzeSentiment}
                disabled={!text || isAnalyzing}
                className="flex-1 min-w-[200px]"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Sentiment"}
              </Button>
              <div className="flex gap-2 flex-1 min-w-[200px]">
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={translateText}
                  disabled={!text || isTranslating}
                  className="flex-1"
                >
                  {isTranslating ? "Translating..." : "Translate"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {(sentiment || translatedText) && (
          <div className="grid gap-6 md:grid-cols-2">
            {sentiment && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Sentiment Analysis
                </h3>
                <div className="space-y-4">
                  <Badge className={`${getSentimentColor()} text-sm`}>
                    {sentiment.label}
                  </Badge>
                  <Progress value={sentiment.score * 100} className="w-full" />
                  <p className="text-sm text-gray-500">
                    Confidence: {(sentiment.score * 100).toFixed(1)}%
                  </p>
                </div>
              </Card>
            )}
            {translatedText && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Translation
                </h3>
                <p className="text-gray-900">{translatedText}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
