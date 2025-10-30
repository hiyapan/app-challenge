import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ScanResult } from '@/contexts/UserContext';

interface TrendChartProps {
  scans: ScanResult[];
  themeColor: string;
}

export function TrendChart({ scans, themeColor }: TrendChartProps) {
  if (scans.length === 0) {
    return null; // Don't show anything if no data
  }

  // Sort scans by date (oldest to newest)
  const sortedScans = [...scans].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ); // Show all scans (removed slice)

  // Get risk value for visualization
  const getRiskValue = (result: string) => {
    switch (result) {
      case 'Low Risk': return 1;
      case 'Medium Risk': return 2;
      case 'High Risk': return 3;
      default: return 0;
    }
  };

  const getRiskColor = (result: string) => {
    switch (result) {
      case 'Low Risk': return '#4CAF50';
      case 'Medium Risk': return '#FF9800';
      case 'High Risk': return '#F44336';
      default: return '#757575';
    }
  };

  // Calculate chart dimensions
  const screenWidth = Dimensions.get('window').width;
  const minPointSpacing = 60; // Minimum space between points
  const calculatedWidth = Math.max(screenWidth - 120, sortedScans.length * minPointSpacing);
  const chartWidth = calculatedWidth;
  const chartHeight = 180;
  const maxValue = 3;
  const pointSpacing = sortedScans.length > 1 ? chartWidth / (sortedScans.length - 1) : 0;

  // Generate points for the line
  const points = sortedScans.map((scan, index) => {
    const x = index * pointSpacing;
    const riskValue = getRiskValue(scan.result);
    const y = chartHeight - (riskValue / maxValue) * chartHeight;
    return { x, y, scan, index };
  });

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Risk Trend</ThemedText>
      <ThemedText style={styles.scrollHint}>← Scroll to see all data →</ThemedText>
      
      {/* Chart Container */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        style={styles.chartScrollView}
        contentContainerStyle={styles.chartScrollContent}
      >
        <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <ThemedText style={styles.axisLabel}>High</ThemedText>
          <ThemedText style={styles.axisLabel}>Medium</ThemedText>
          <ThemedText style={styles.axisLabel}>Low</ThemedText>
        </View>

        {/* Chart Area */}
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines */}
          <View style={[styles.gridLine, { top: 0 }]} />
          <View style={[styles.gridLine, { top: chartHeight / 3 }]} />
          <View style={[styles.gridLine, { top: (chartHeight / 3) * 2 }]} />
          <View style={[styles.gridLine, { top: chartHeight }]} />

          {/* Line segments and points */}
          {points.map((point, index) => {
            if (index === 0) return null;
            const prevPoint = points[index - 1];
            const lineLength = Math.sqrt(
              Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
            );
            const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x) * (180 / Math.PI);

            return (
              <View
                key={`line-${index}`}
                style={[
                  styles.line,
                  {
                    width: lineLength,
                    left: prevPoint.x,
                    top: prevPoint.y,
                    backgroundColor: getRiskColor(point.scan.result),
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: 'left center',
                  },
                ]}
              />
            );
          })}

          {/* Data points */}
          {points.map((point, index) => (
            <View
              key={`point-${index}`}
              style={[
                styles.point,
                {
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: getRiskColor(point.scan.result),
                  borderColor: getRiskColor(point.scan.result),
                },
              ]}
            >
              <View style={styles.pointInner} />
            </View>
          ))}
        </View>
        </View>
      </ScrollView>

      {/* X-axis labels (dates) */}
      <View style={styles.xAxisContainer}>
        <View style={[styles.xAxisLabels, { width: chartWidth }]}>
          {sortedScans.length > 0 && (
            <>
              <ThemedText style={styles.xAxisLabel}>
                {new Date(sortedScans[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </ThemedText>
              {sortedScans.length > 1 && (
                <ThemedText style={styles.xAxisLabel}>
                  {new Date(sortedScans[sortedScans.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </ThemedText>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  scrollHint: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 15,
    textAlign: 'center',
  },
  chartScrollView: {
    marginBottom: 10,
  },
  chartScrollContent: {
    paddingRight: 20,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    opacity: 0.7,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
  },
  chartContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: 10,
    paddingVertical: 5,
  },
  axisLabel: {
    fontSize: 11,
    opacity: 0.7,
    fontWeight: '500',
  },
  chartArea: {
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 8,
    overflow: 'visible',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  line: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  xAxisContainer: {
    alignItems: 'flex-end',
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  xAxisLabel: {
    fontSize: 11,
    opacity: 0.7,
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 15,
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
