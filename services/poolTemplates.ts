export interface PoolTemplate {
  id: string;
  name: string;
  icon: string;
  category: 'travel' | 'house' | 'car' | 'wedding' | 'education' | 'technology' | 'emergency' | 'other';
  showLocation: boolean;
  customFields: TemplateField[];
  suggestedAmounts: number[];
  description: string;
}

export interface TemplateField {
  id: string;
  name: string;
  placeholder: string;
  type: 'text' | 'number' | 'currency' | 'date';
  required: boolean;
  defaultValue?: string | number;
}

export class PoolTemplateService {
  private static readonly TEMPLATES: PoolTemplate[] = [
    // Travel Templates
    {
      id: 'vacation_trip',
      name: 'Vacation Trip',
      icon: '✈️',
      category: 'travel',
      showLocation: true,
      description: 'Plan your dream vacation with flights, hotels, and activities',
      suggestedAmounts: [1500, 3000, 5000, 8000, 12000],
      customFields: [
        {
          id: 'flight_budget',
          name: 'Flight Budget',
          placeholder: '800',
          type: 'currency',
          required: false
        },
        {
          id: 'hotel_budget',
          name: 'Hotel Budget',
          placeholder: '1200',
          type: 'currency',
          required: false
        },
        {
          id: 'activities_budget',
          name: 'Activities & Food',
          placeholder: '1000',
          type: 'currency',
          required: false
        },
        {
          id: 'trip_duration',
          name: 'Trip Duration (days)',
          placeholder: '7',
          type: 'number',
          required: false
        }
      ]
    },
    {
      id: 'weekend_getaway',
      name: 'Weekend Getaway',
      icon: '🏖️',
      category: 'travel',
      showLocation: true,
      description: 'Quick escape for a refreshing weekend',
      suggestedAmounts: [500, 800, 1200, 1800],
      customFields: [
        {
          id: 'transportation',
          name: 'Transportation',
          placeholder: '200',
          type: 'currency',
          required: false
        },
        {
          id: 'accommodation',
          name: 'Accommodation',
          placeholder: '300',
          type: 'currency',
          required: false
        }
      ]
    },

    // Wedding Templates
    {
      id: 'dream_wedding',
      name: 'Dream Wedding',
      icon: '💒',
      category: 'wedding',
      showLocation: true,
      description: 'Save for your perfect wedding day',
      suggestedAmounts: [15000, 25000, 40000, 60000, 80000],
      customFields: [
        {
          id: 'venue_cost',
          name: 'Venue Cost',
          placeholder: '12000',
          type: 'currency',
          required: false
        },
        {
          id: 'catering_cost',
          name: 'Catering',
          placeholder: '8000',
          type: 'currency',
          required: false
        },
        {
          id: 'flowers_decor',
          name: 'Flowers & Decor',
          placeholder: '3000',
          type: 'currency',
          required: false
        },
        {
          id: 'photography',
          name: 'Photography',
          placeholder: '2500',
          type: 'currency',
          required: false
        },
        {
          id: 'wedding_cake',
          name: 'Wedding Cake',
          placeholder: '800',
          type: 'currency',
          required: false
        },
        {
          id: 'wedding_date',
          name: 'Wedding Date',
          placeholder: 'Select date',
          type: 'date',
          required: false
        },
        {
          id: 'guest_count',
          name: 'Expected Guests',
          placeholder: '100',
          type: 'number',
          required: false
        }
      ]
    },
    {
      id: 'honeymoon',
      name: 'Honeymoon',
      icon: '🌺',
      category: 'wedding',
      showLocation: true,
      description: 'Romantic getaway after your wedding',
      suggestedAmounts: [3000, 5000, 8000, 12000],
      customFields: [
        {
          id: 'honeymoon_duration',
          name: 'Duration (days)',
          placeholder: '10',
          type: 'number',
          required: false
        }
      ]
    },

    // House Templates
    {
      id: 'house_downpayment',
      name: 'House Down Payment',
      icon: '🏠',
      category: 'house',
      showLocation: false,
      description: 'Save for your dream home down payment',
      suggestedAmounts: [20000, 40000, 60000, 80000, 100000],
      customFields: [
        {
          id: 'home_price',
          name: 'Target Home Price',
          placeholder: '400000',
          type: 'currency',
          required: false
        },
        {
          id: 'down_payment_percent',
          name: 'Down Payment %',
          placeholder: '20',
          type: 'number',
          required: false
        },
        {
          id: 'closing_costs',
          name: 'Closing Costs',
          placeholder: '8000',
          type: 'currency',
          required: false
        },
        {
          id: 'moving_expenses',
          name: 'Moving Expenses',
          placeholder: '2000',
          type: 'currency',
          required: false
        }
      ]
    },
    {
      id: 'home_renovation',
      name: 'Home Renovation',
      icon: '🔨',
      category: 'house',
      showLocation: false,
      description: 'Transform your living space',
      suggestedAmounts: [5000, 10000, 20000, 35000, 50000],
      customFields: [
        {
          id: 'kitchen_budget',
          name: 'Kitchen Renovation',
          placeholder: '15000',
          type: 'currency',
          required: false
        },
        {
          id: 'bathroom_budget',
          name: 'Bathroom Renovation',
          placeholder: '8000',
          type: 'currency',
          required: false
        },
        {
          id: 'flooring_budget',
          name: 'Flooring',
          placeholder: '5000',
          type: 'currency',
          required: false
        }
      ]
    },

    // Car Templates
    {
      id: 'new_car',
      name: 'New Car',
      icon: '🚗',
      category: 'car',
      showLocation: false,
      description: 'Save for your next vehicle',
      suggestedAmounts: [5000, 15000, 25000, 35000, 50000],
      customFields: [
        {
          id: 'car_make_model',
          name: 'Car Make & Model',
          placeholder: 'Toyota Camry',
          type: 'text',
          required: false
        },
        {
          id: 'car_price',
          name: 'Car Price',
          placeholder: '28000',
          type: 'currency',
          required: false
        },
        {
          id: 'trade_in_value',
          name: 'Trade-in Value',
          placeholder: '8000',
          type: 'currency',
          required: false
        },
        {
          id: 'insurance_setup',
          name: 'Insurance Setup',
          placeholder: '1200',
          type: 'currency',
          required: false
        }
      ]
    },

    // Education Templates
    {
      id: 'college_tuition',
      name: 'College Tuition',
      icon: '🎓',
      category: 'education',
      showLocation: false,
      description: 'Invest in your education and future',
      suggestedAmounts: [10000, 20000, 40000, 60000, 80000],
      customFields: [
        {
          id: 'tuition_cost',
          name: 'Tuition Cost',
          placeholder: '25000',
          type: 'currency',
          required: false
        },
        {
          id: 'books_supplies',
          name: 'Books & Supplies',
          placeholder: '1500',
          type: 'currency',
          required: false
        },
        {
          id: 'room_board',
          name: 'Room & Board',
          placeholder: '12000',
          type: 'currency',
          required: false
        },
        {
          id: 'semester_count',
          name: 'Number of Semesters',
          placeholder: '8',
          type: 'number',
          required: false
        }
      ]
    },
    {
      id: 'certification_course',
      name: 'Certification Course',
      icon: '📚',
      category: 'education',
      showLocation: false,
      description: 'Advance your career with new skills',
      suggestedAmounts: [500, 1500, 3000, 5000],
      customFields: [
        {
          id: 'course_fee',
          name: 'Course Fee',
          placeholder: '2000',
          type: 'currency',
          required: false
        },
        {
          id: 'materials_cost',
          name: 'Materials & Software',
          placeholder: '500',
          type: 'currency',
          required: false
        }
      ]
    },

    // Technology Templates
    {
      id: 'new_laptop',
      name: 'New Laptop',
      icon: '💻',
      category: 'technology',
      showLocation: false,
      description: 'Upgrade your tech for work or play',
      suggestedAmounts: [800, 1200, 1800, 2500, 3500],
      customFields: [
        {
          id: 'laptop_model',
          name: 'Laptop Model',
          placeholder: 'MacBook Pro 14"',
          type: 'text',
          required: false
        },
        {
          id: 'accessories_budget',
          name: 'Accessories',
          placeholder: '300',
          type: 'currency',
          required: false
        },
        {
          id: 'software_budget',
          name: 'Software',
          placeholder: '200',
          type: 'currency',
          required: false
        }
      ]
    },
    {
      id: 'home_theater',
      name: 'Home Theater Setup',
      icon: '📺',
      category: 'technology',
      showLocation: false,
      description: 'Create the ultimate entertainment experience',
      suggestedAmounts: [2000, 4000, 6000, 10000],
      customFields: [
        {
          id: 'tv_cost',
          name: 'TV Cost',
          placeholder: '1500',
          type: 'currency',
          required: false
        },
        {
          id: 'sound_system',
          name: 'Sound System',
          placeholder: '800',
          type: 'currency',
          required: false
        },
        {
          id: 'streaming_setup',
          name: 'Streaming Setup',
          placeholder: '300',
          type: 'currency',
          required: false
        }
      ]
    },

    // Emergency Fund
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      icon: '🛡️',
      category: 'emergency',
      showLocation: false,
      description: 'Build financial security for unexpected expenses',
      suggestedAmounts: [1000, 3000, 6000, 10000, 15000],
      customFields: [
        {
          id: 'monthly_expenses',
          name: 'Monthly Expenses',
          placeholder: '3000',
          type: 'currency',
          required: false
        },
        {
          id: 'target_months',
          name: 'Months of Coverage',
          placeholder: '6',
          type: 'number',
          required: false
        }
      ]
    },

    // Other/Custom
    {
      id: 'custom_goal',
      name: 'Custom Goal',
      icon: '🎯',
      category: 'other',
      showLocation: false,
      description: 'Create a personalized savings goal',
      suggestedAmounts: [500, 1000, 2500, 5000, 10000],
      customFields: [
        {
          id: 'goal_description',
          name: 'Goal Description',
          placeholder: 'Describe your savings goal',
          type: 'text',
          required: false
        }
      ]
    }
  ];

  public static getAllTemplates(): PoolTemplate[] {
    return [...this.TEMPLATES];
  }

  public static getTemplatesByCategory(category: PoolTemplate['category']): PoolTemplate[] {
    return this.TEMPLATES.filter(template => template.category === category);
  }

  public static getTemplateById(id: string): PoolTemplate | undefined {
    return this.TEMPLATES.find(template => template.id === id);
  }

  public static getCategories(): Array<{
    key: PoolTemplate['category'];
    name: string;
    icon: string;
  }> {
    return [
      { key: 'travel', name: 'Travel', icon: '✈️' },
      { key: 'house', name: 'Home', icon: '🏠' },
      { key: 'car', name: 'Vehicle', icon: '🚗' },
      { key: 'wedding', name: 'Wedding', icon: '💒' },
      { key: 'education', name: 'Education', icon: '🎓' },
      { key: 'technology', name: 'Technology', icon: '💻' },
      { key: 'emergency', name: 'Emergency', icon: '🛡️' },
      { key: 'other', name: 'Other', icon: '🎯' }
    ];
  }

  public static calculateTotalFromFields(template: PoolTemplate, fieldValues: Record<string, any>): number {
    let total = 0;
    
    template.customFields.forEach(field => {
      if (field.type === 'currency' && fieldValues[field.id]) {
        const value = parseFloat(fieldValues[field.id]);
        if (!isNaN(value)) {
          total += value;
        }
      }
    });

    return total;
  }

  public static getSmartSuggestions(template: PoolTemplate, fieldValues: Record<string, any>): {
    suggestedTotal: number;
    breakdown: string[];
    tips: string[];
  } {
    const calculatedTotal = this.calculateTotalFromFields(template, fieldValues);
    
    let suggestedTotal = calculatedTotal;
    const breakdown: string[] = [];
    const tips: string[] = [];

    // Add smart suggestions based on template type
    switch (template.category) {
      case 'travel':
        if (!calculatedTotal) {
          suggestedTotal = template.suggestedAmounts[1]; // Default to second option
        }
        tips.push('💡 Book flights 2-3 months in advance for better prices');
        tips.push('🏨 Consider vacation rentals for longer stays');
        break;

      case 'wedding':
        if (fieldValues.guest_count) {
          const guestCount = parseInt(fieldValues.guest_count);
          const perGuestCost = calculatedTotal / guestCount;
          breakdown.push(`~$${perGuestCost.toFixed(0)} per guest`);
        }
        tips.push('💍 Wedding costs typically increase 10-20% from initial budget');
        tips.push('📅 Book vendors 6-12 months in advance');
        break;

      case 'house':
        if (fieldValues.home_price && fieldValues.down_payment_percent) {
          const homePrice = parseFloat(fieldValues.home_price);
          const downPercent = parseFloat(fieldValues.down_payment_percent);
          const downPayment = (homePrice * downPercent) / 100;
          breakdown.push(`${downPercent}% of $${homePrice.toLocaleString()} = $${downPayment.toLocaleString()}`);
        }
        tips.push('🏠 Factor in closing costs (2-5% of home price)');
        tips.push('💰 Consider PMI if down payment is less than 20%');
        break;

      case 'emergency':
        if (fieldValues.monthly_expenses && fieldValues.target_months) {
          const monthlyExpenses = parseFloat(fieldValues.monthly_expenses);
          const targetMonths = parseInt(fieldValues.target_months);
          suggestedTotal = monthlyExpenses * targetMonths;
          breakdown.push(`${targetMonths} months × $${monthlyExpenses.toLocaleString()} = $${suggestedTotal.toLocaleString()}`);
        }
        tips.push('🛡️ Start with $1,000, then build to 3-6 months of expenses');
        break;
    }

    return {
      suggestedTotal,
      breakdown,
      tips
    };
  }
}
