export interface RegressionResult {
    slope: number;
    intercept: number;
    rSquared: number;
    points: { x: number; y: number }[];
}

export class LinearRegression {
    /**
     * Calculates linear regression (Least Squares) for a given set of points.
     * x: time in days (or any numeric scale)
     * y: performance metric (e.g., 1RM weight)
     */
    static calculate(data: { x: number; y: number }[]): RegressionResult {
        if (data.length < 2) {
            return { slope: 0, intercept: data[0]?.y || 0, rSquared: 0, points: data };
        }

        const n = data.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        let sumY2 = 0;

        for (const point of data) {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumX2 += point.x * point.x;
            sumY2 += point.y * point.y;
        }

        const denominator = (n * sumX2 - sumX * sumX);
        const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R^2
        const yMean = sumY / n;
        let ssTot = 0;
        let ssRes = 0;

        for (const point of data) {
            const yPred = slope * point.x + intercept;
            ssTot += Math.pow(point.y - yMean, 2);
            ssRes += Math.pow(point.y - yPred, 2);
        }

        const rSquared = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

        return { slope, intercept, rSquared, points: data };
    }

    /**
     * Predicts Y for a given X based on regression results
     */
    static predict(result: RegressionResult, x: number): number {
        return result.slope * x + result.intercept;
    }

    /**
     * Calculates confidence interval (Standard Error of Performance)
     * Returns the margin of error at a basic standard deviation level
     */
    static getMarginOfError(result: RegressionResult): number {
        if (result.points.length < 3) return 0;

        let sumSquaredErrors = 0;
        for (const point of result.points) {
            const yPred = result.slope * point.x + result.intercept;
            sumSquaredErrors += Math.pow(point.y - yPred, 2);
        }

        const standardError = Math.sqrt(sumSquaredErrors / (result.points.length - 2));
        return standardError;
    }
}
