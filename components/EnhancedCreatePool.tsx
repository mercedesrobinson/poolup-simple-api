import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors, radius } from '../theme';
import { PoolTemplateService, PoolTemplate, TemplateField } from '../services/poolTemplates';

interface EnhancedCreatePoolProps {
  onPoolCreate: (poolData: any) => void;
  onBack: () => void;
}

export const EnhancedCreatePool: React.FC<EnhancedCreatePoolProps> = ({
  onPoolCreate,
  onBack
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PoolTemplate['category'] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PoolTemplate | null>(null);
  const [poolName, setPoolName] = useState('');
  const [poolGoal, setPoolGoal] = useState('');
  const [location, setLocation] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const categories = PoolTemplateService.getCategories();

  const handleCategorySelect = (category: PoolTemplate['category']) => {
    setSelectedCategory(category);
    setSelectedTemplate(null);
    setFieldValues({});
  };

  const handleTemplateSelect = (template: PoolTemplate) => {
    setSelectedTemplate(template);
    setPoolName(template.name);
    
    // Set default goal from template suggestions
    if (template.suggestedAmounts.length > 0) {
      setPoolGoal(template.suggestedAmounts[1].toString());
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const calculateSmartTotal = () => {
    if (!selectedTemplate) return;
    
    const suggestions = PoolTemplateService.getSmartSuggestions(selectedTemplate, fieldValues);
    if (suggestions.suggestedTotal > 0) {
      setPoolGoal(suggestions.suggestedTotal.toString());
    }
  };

  const handleCreatePool = () => {
    if (!poolName.trim() || !poolGoal.trim()) {
      Alert.alert('Missing Information', 'Please enter a pool name and goal amount.');
      return;
    }

    const poolData = {
      name: poolName,
      goal_cents: parseFloat(poolGoal) * 100,
      destination: location,
      template_id: selectedTemplate?.id,
      custom_fields: fieldValues,
      category: selectedTemplate?.category
    };

    onPoolCreate(poolData);
  };

  const renderCategorySelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Your Savings Goal</Text>
      <View style={styles.categoryGrid}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryCard,
              selectedCategory === category.key && styles.categoryCardSelected
            ]}
            onPress={() => handleCategorySelect(category.key)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTemplateSelection = () => {
    if (!selectedCategory) return null;

    const templates = PoolTemplateService.getTemplatesByCategory(selectedCategory);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Template</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {templates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={[
                styles.templateCard,
                selectedTemplate?.id === template.id && styles.templateCardSelected
              ]}
              onPress={() => handleTemplateSelect(template)}
            >
              <Text style={styles.templateIcon}>{template.icon}</Text>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDescription}>{template.description}</Text>
              <View style={styles.suggestedAmounts}>
                {template.suggestedAmounts.slice(0, 3).map((amount, index) => (
                  <Text key={index} style={styles.suggestedAmount}>
                    ${amount.toLocaleString()}
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderCustomFields = () => {
    if (!selectedTemplate || selectedTemplate.customFields.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customize Your Goal</Text>
        {selectedTemplate.customFields.map(field => (
          <View key={field.id} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{field.name}</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder={field.placeholder}
              value={fieldValues[field.id] || ''}
              onChangeText={(value) => handleFieldChange(field.id, value)}
              keyboardType={field.type === 'number' || field.type === 'currency' ? 'numeric' : 'default'}
            />
          </View>
        ))}
        
        <TouchableOpacity style={styles.calculateButton} onPress={calculateSmartTotal}>
          <Text style={styles.calculateButtonText}>🧮 Calculate Smart Total</Text>
        </TouchableOpacity>

        {/* Smart Suggestions */}
        {(() => {
          const suggestions = PoolTemplateService.getSmartSuggestions(selectedTemplate, fieldValues);
          if (suggestions.tips.length === 0) return null;

          return (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Smart Tips</Text>
              {suggestions.tips.map((tip, index) => (
                <Text key={index} style={styles.tip}>{tip}</Text>
              ))}
            </View>
          );
        })()}
      </View>
    );
  };

  const renderBasicFields = () => {
    if (!selectedTemplate) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pool Details</Text>
        
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Pool Name</Text>
          <TextInput
            style={styles.fieldInput}
            value={poolName}
            onChangeText={setPoolName}
            placeholder="Enter pool name"
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Goal Amount</Text>
          <TextInput
            style={styles.fieldInput}
            value={poolGoal}
            onChangeText={setPoolGoal}
            placeholder="5000"
            keyboardType="numeric"
          />
        </View>

        {selectedTemplate.showLocation && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location (Optional)</Text>
            <TextInput
              style={styles.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder="Where are you going?"
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create New Pool</Text>
      </View>

      {renderCategorySelection()}
      {renderTemplateSelection()}
      {renderCustomFields()}
      {renderBasicFields()}

      {selectedTemplate && (
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePool}>
          <Text style={styles.createButtonText}>Create Pool</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFCFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: colors.blue,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: radius.medium,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  categoryCardSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blue + '10',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  templateCard: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: radius.medium,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  templateCardSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blue + '10',
  },
  templateIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  suggestedAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestedAmount: {
    fontSize: 10,
    color: colors.green,
    fontWeight: '600',
    backgroundColor: colors.green + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: 'white',
    borderRadius: radius.medium,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  calculateButton: {
    backgroundColor: colors.purple,
    borderRadius: radius.medium,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: colors.blue + '10',
    borderRadius: radius.medium,
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  tip: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 16,
  },
  createButton: {
    backgroundColor: colors.green,
    borderRadius: radius.medium,
    padding: 16,
    margin: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
