import { useState } from 'react';
import { ChevronRight, Wallet, Target, CreditCard, BarChart3, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const WorkflowGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isDark } = useTheme();

  const steps = [
    {
      title: "Create Your First Wallet",
      icon: Wallet,
      description: "Start by creating a wallet to organize your finances. Think of it as your digital bank account.",
      details: [
        "Personal wallet for daily expenses",
        "Shared wallet for family expenses", 
        "Business wallet for work-related costs",
        "Each wallet tracks its own balance separately",
        "You can have multiple wallets for different purposes"
      ],
      color: "blue"
    },
    {
      title: "Add Your Income",
      icon: CreditCard,
      description: "Add income to your wallet first. You can't create budgets or make expenses without money!",
      details: [
        "Add salary, freelance payments, gifts, or any money you receive",
        "Income creates your spending power",
        "Multiple income sources can be added",
        "This is your available money for budgeting and expenses",
        "Without income, you cannot create realistic budgets"
      ],
      color: "green"
    },
    {
      title: "Create Smart Budgets",
      icon: Target,
      description: "Set spending limits for different categories. Budgets cannot exceed your wallet balance.",
      details: [
        "Budget only what you actually have in your wallet",
        "Categories like Food, Transportation, Entertainment",
        "System prevents over-budgeting beyond your means",
        "Leave some money unbudgeted for emergencies",
        "Budgets help control and track your spending"
      ],
      color: "purple"
    },
    {
      title: "Track Expenses Wisely",
      icon: BarChart3,
      description: "Record expenses with automatic validation against budgets and wallet balance.",
      details: [
        "Cannot spend more than your wallet balance",
        "Cannot exceed individual category budget limits",
        "Get warnings when approaching limits",
        "Duplicate transaction detection",
        "AI-generated transaction descriptions"
      ],
      color: "orange"
    }
  ];

  const validationRules = [
    {
      icon: AlertCircle,
      title: "Income First Rule",
      description: "You must add income to your wallet before creating budgets or making expenses. No money = no spending!",
      type: "error"
    },
    {
      icon: AlertCircle,
      title: "Budget Reality Check",
      description: "Cannot create budgets that exceed your wallet balance. You can only budget money you actually have.",
      type: "error"
    },
    {
      icon: AlertCircle,
      title: "Spending Limits",
      description: "Expense transactions are blocked if they exceed budget limits or wallet balance.",
      type: "error"
    },
    {
      icon: Info,
      title: "Smart Warnings",
      description: "Get alerts when spending approaches budget limits or uses large portions of your balance.",
      type: "info"
    },
    {
      icon: AlertCircle,
      title: "Duplicate Detection",
      description: "System warns about potential duplicate transactions to prevent accidental double-entries.",
      type: "warning"
    },
    {
      icon: Info,
      title: "Future Planning",
      description: "Can create budgets for future months, but not for past periods.",
      type: "info"
    }
  ];

  const getStepColor = (color) => {
    const colors = {
      blue: `${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800' : 'bg-blue-100 text-blue-600 border-blue-200'}`,
      green: `${isDark ? 'bg-green-900/20 text-green-400 border-green-800' : 'bg-green-100 text-green-600 border-green-200'}`,
      purple: `${isDark ? 'bg-purple-900/20 text-purple-400 border-purple-800' : 'bg-purple-100 text-purple-600 border-purple-200'}`,
      orange: `${isDark ? 'bg-orange-900/20 text-orange-400 border-orange-800' : 'bg-orange-100 text-orange-600 border-orange-200'}`
    };
    return colors[color] || colors.blue;
  };

  const getValidationType = (type) => {
    const types = {
      error: `${isDark ? 'bg-red-900/20 border-red-800 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`,
      warning: `${isDark ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`,
      info: `${isDark ? 'bg-blue-900/20 border-blue-800 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'}`
    };
    return types[type] || types.info;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Budget Tracker Workflow Guide</h2>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✕
            </button>
          </div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Learn how to effectively use the budget tracking system
          </p>
        </div>

        <div className="p-6">
          {/* Workflow Steps */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Realistic Financial Workflow</h3>
            <div className={`mb-4 p-3 ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} rounded-lg border`}>
              <p className={`text-sm ${isDark ? 'text-green-200' : 'text-green-800'}`}>
                <strong>Important:</strong> This system follows real-world financial principles. You must have money before you can budget or spend it!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      currentStep === index 
                        ? getStepColor(step.color)
                        : `${isDark ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getStepColor(step.color)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {index + 1}. {step.title}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {step.description}
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${
                        currentStep === index ? 'rotate-90' : ''
                      }`} />
                    </div>
                    
                    {currentStep === index && (
                      <div className="mt-4 pl-10">
                        <ul className="space-y-2">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start space-x-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Rules */}
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Important Validation Rules</h3>
            <div className="space-y-3">
              {validationRules.map((rule, index) => {
                const Icon = rule.icon;
                return (
                  <div key={index} className={`p-4 rounded-lg border ${getValidationType(rule.type)}`}>
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{rule.title}</h4>
                        <p className="text-sm mt-1">{rule.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Start Tips */}
          <div className={`mt-8 p-4 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg border`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-blue-100' : 'text-blue-900'} mb-2`}>Quick Start Guide</h3>
            <div className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'} space-y-2`}>
              <div className="font-medium">Step 1: Create a wallet</div>
              <div className="font-medium">Step 2: Add your income (salary, freelance, etc.)</div>
              <div className="font-medium">Step 3: Create budgets for spending categories</div>
              <div className="font-medium">Step 4: Track your expenses within budget limits</div>
              <div className={`mt-3 pt-3 border-t ${isDark ? 'border-blue-700' : 'border-blue-200'}`}>
                <div className={`font-medium ${isDark ? 'text-blue-100' : 'text-blue-900'}`}>💡 Pro Tips:</div>
                <ul className="mt-1 space-y-1">
                  <li>• Always add income before creating budgets</li>
                  <li>• Don't budget 100% of your money - leave some for emergencies</li>
                  <li>• Use AI features for transaction descriptions and budget advice</li>
                  <li>• Check warnings to avoid overspending</li>
                  <li>• Review your dashboard regularly to stay on track</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`p-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Got it! Let's start tracking
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowGuide;