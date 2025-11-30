import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

import { colors, spacing, typography, shadows } from '../theme';

const JobCard = ({ job, onPress }) => {
  const {
    title,
    employer,
    district,
    salaryMin,
    salaryMax,
    jobType,
    createdAt,
    matchScore,
    isUrgent,
    isFeatured,
  } = job;

  const getJobTypeLabel = (type) => {
    const labels = {
      full_time: 'ফুল টাইম',
      part_time: 'পার্ট টাইম',
      contract: 'চুক্তি',
      internship: 'ইন্টার্নশিপ',
    };
    return labels[type] || type;
  };

  const formatSalary = (min, max) => {
    if (min === max) return `৳${min.toLocaleString('bn-BD')}`;
    return `৳${min.toLocaleString('bn-BD')} - ${max.toLocaleString('bn-BD')}`;
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: bn,
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.card, isFeatured && styles.featuredCard]}>
        <Card.Content>
          {/* Header with badges */}
          <View style={styles.header}>
            <View style={styles.badges}>
              {isUrgent && (
                <Chip
                  icon="clock-fast"
                  style={styles.urgentBadge}
                  textStyle={styles.urgentText}
                  compact
                >
                  জরুরি
                </Chip>
              )}
              {isFeatured && (
                <Chip
                  icon="star"
                  style={styles.featuredBadge}
                  textStyle={styles.featuredText}
                  compact
                >
                  ফিচারড
                </Chip>
              )}
            </View>
            {matchScore && (
              <View style={styles.matchScore}>
                <Icon name="chart-line" size={16} color={colors.success} />
                <Text style={styles.matchScoreText}>{matchScore}% ম্যাচ</Text>
              </View>
            )}
          </View>

          {/* Job Title */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Company Name */}
          <View style={styles.companyRow}>
            <Icon name="domain" size={16} color={colors.textSecondary} />
            <Text style={styles.companyName} numberOfLines={1}>
              {employer?.businessName || employer?.name}
            </Text>
            {employer?.isVerified && (
              <Icon name="check-decagram" size={16} color={colors.primary} />
            )}
          </View>

          {/* Location */}
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{district}</Text>
          </View>

          {/* Salary */}
          <View style={styles.infoRow}>
            <Icon name="cash" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{formatSalary(salaryMin, salaryMax)}</Text>
            <Text style={styles.infoTextLight}>/মাস</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Chip icon="briefcase" compact style={styles.typeChip}>
                {getJobTypeLabel(jobType)}
              </Chip>
              <Text style={styles.timeAgo}>{timeAgo}</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.primary} />
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    ...shadows.medium,
  },
  featuredCard: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  urgentBadge: {
    backgroundColor: '#FFE5E5',
    height: 24,
  },
  urgentText: {
    color: colors.error,
    fontSize: 12,
  },
  featuredBadge: {
    backgroundColor: '#FFF3E0',
    height: 24,
  },
  featuredText: {
    color: colors.accent,
    fontSize: 12,
  },
  matchScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchScoreText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  title: {
    ...typography.h4,
    marginBottom: spacing.xs,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  companyName: {
    ...typography.bodySmall,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  infoTextLight: {
    ...typography.caption,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  typeChip: {
    height: 28,
    backgroundColor: colors.surface,
  },
  timeAgo: {
    ...typography.caption,
  },
});

export default JobCard;
