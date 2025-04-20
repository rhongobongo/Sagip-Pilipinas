import { ArrowBigDown, ArrowBigUp } from "lucide-react";

const TrendIcon: React.FC<{ trend: string }> = ({ trend }) => {
    if (trend === "up") {
        return (
            <ArrowBigUp className="w-5 h-5 inline-block text-green-500" />
        );
    } else if (trend === "down") {
        return (
            <ArrowBigDown className="w-5 h-5 inline-block text-red-500" />
        );
    }
    return null;
};

export default TrendIcon;