import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const SimulationLog = () => {
  const { simLogs, language } = useSimulationStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [simLogs]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'OK':
      case 'DONE':
        return colors.down;
      case 'PROB':
      case 'WARN':
      case 'CAL ':
        return colors.neutral;
      case 'ERR':
        return colors.up;
      default:
        return colors.text2;
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.cardTitleRow}>
          <View style={[styles.dot, { backgroundColor: colors.text3 }]} />
          <Text style={styles.cardTitle}>{language === 'en' ? 'Console' : 'Console / Log'}</Text>
          <View style={styles.logCountBadge}>
            <Text style={styles.logCountText}>{simLogs.length}</Text>
          </View>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.text3}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.logContainer}>
          <ScrollView ref={scrollViewRef} style={styles.scrollView} nestedScrollEnabled>
            {simLogs.map((log, index) => (
              <View key={index} style={styles.logLine}>
                <Text style={[styles.logType, { color: getLogColor(log.type) }]}>
                  {log.type.padEnd(4)}
                </Text>
                <Text style={[styles.logMsg, { color: getLogColor(log.type) }]}>
                  {log.msg}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  logCountBadge: {
    backgroundColor: colors.card2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 22,
    alignItems: 'center',
  },
  logCountText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text3,
  },
  logContainer: {
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  logLine: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  logType: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginRight: 6,
    fontWeight: '700',
    width: 36,
  },
  logMsg: {
    flex: 1,
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 15,
    opacity: 0.85,
  },
});
