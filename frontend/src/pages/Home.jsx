import { useContext, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BarChart3, Users, Zap, CreditCard, Building2, TrendingUp, Star, Shield, IndianRupee } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const { user } = useContext(AuthContext);
  const shieldRef = useRef(null);
  const trustedCompaniesRef = useRef(null);
  const [stats, setStats] = useState({
    transactions: 0,
    users: 0,
    companies: 0,
    savings: 0
  });

  useEffect(() => {
    if (!user && shieldRef.current && trustedCompaniesRef.current) {
      const shield = shieldRef.current;
      const target = trustedCompaniesRef.current;

      // Set initial position
      gsap.set(shield, {
        rotation: 0,
        scale: 1,
        opacity: 0.8
      });

      // Animate shield to trusted companies position on scroll
      gsap.to(shield, {
        scrollTrigger: {
          trigger: "#stats-section",
          start: "top 80%",
          end: "top 30%",
          scrub: 1,
        },
        x: () => {
          const shieldRect = shield.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const deltaX = (targetRect.left + targetRect.width/2) - (shieldRect.left + shieldRect.width/2);
          return viewportWidth < 768 ? deltaX * 1 : deltaX;
        },
        y: () => {
          const shieldRect = shield.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const deltaY = (targetRect.top + targetRect.height/2) - (shieldRect.top + shieldRect.height/2) - 20;
          return viewportWidth < 768 ? deltaY * 1 : deltaY;
        },
        scale: 0.25,
        opacity: 1,
        ease: "power2.inOut"
      });
    }

    // Stats animation
    const animateStats = () => {
      const targets = {
        transactions: 2847293,
        users: 45672,
        companies: 1247,
        savings: 18500000
      };
      
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      
      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        
        setStats({
          transactions: Math.floor(targets.transactions * progress),
          users: Math.floor(targets.users * progress),
          companies: Math.floor(targets.companies * progress),
          savings: Math.floor(targets.savings * progress)
        });
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setStats(targets);
        }
      }, stepDuration);
    };
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateStats();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    
    const statsElement = document.getElementById('stats-section');
    if (statsElement) {
      observer.observe(statsElement);
    }
    
    return () => {
      observer.disconnect();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [user]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString();
  };

  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Track your spending patterns with detailed charts and insights"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "256-bit encryption keeps your financial data safe and secure"
    },
    {
      icon: CreditCard,
      title: "Transaction Tracking",
      description: "Automatically categorize and track all your income and expenses"
    },
    {
      icon: TrendingUp,
      title: "Budget Management",
      description: "Set smart budgets and get alerts when you're close to limits"
    },
    {
      icon: Building2,
      title: "Multi-Wallet Support",
      description: "Manage personal, family, and business wallets in one place"
    },
    {
      icon: Star,
      title: "Advanced Reports",
      description: "Generate detailed financial reports with beautiful visualizations"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8 items-center">
          {/* Left Content - 70% */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left lg:pr-8"
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Take Control of Your
              <motion.span 
                className="text-blue-600 dark:text-blue-400 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              > Financial Future</motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your financial habits with our intelligent budget tracking platform. 
              Monitor expenses, create smart budgets, collaborate with family, and achieve your 
              financial goals faster than ever before.
            </motion.p>
            
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {user ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 px-10 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-6 w-6" />
                  </Link>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 sm:py-5 px-6 sm:px-10 rounded-xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center space-x-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-4 sm:py-5 px-6 sm:px-10 rounded-xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                    >
                      <span>Sign In</span>
                    </Link>
                  </motion.div>
                </div>
              )}
              
              <motion.div 
                className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-sm text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>45K+ users trust us</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Shield Icon - 30% */}
          {!user && (
            <div className="relative flex justify-center items-center h-full mt-8 lg:mt-0">
              <motion.div
                ref={shieldRef}
                className="relative"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 0.9, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full flex items-center justify-center relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 animate-pulse"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-blue-100/50 to-indigo-200/50 dark:from-blue-800/20 dark:to-indigo-800/20 rounded-full"></div>
                  <Shield className="h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 text-blue-600 dark:text-blue-400 relative z-10 drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/20 dark:to-black/20"></div>
                  <div className="absolute top-6 right-6 sm:top-8 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-10 left-10 sm:bottom-12 sm:left-12 w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        id="stats-section" 
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by thousands worldwide
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Join our growing community of smart money managers
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { icon: CreditCard, value: stats.transactions, label: "Daily Transactions", color: "green" },
              { icon: Users, value: stats.users, label: "Active Users", color: "blue" },
              { value: stats.companies, label: "Trusted Companies", color: "purple", isShieldTarget: true },
              { icon: TrendingUp, value: stats.savings, label: "Money Saved", color: "orange", prefix: "$" }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index} 
                  className="text-center"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    ref={stat.isShieldTarget ? trustedCompaniesRef : null}
                    className={`bg-${stat.color}-100 dark:bg-${stat.color}-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {Icon && <Icon className={`h-8 w-8 text-${stat.color}-600 dark:text-${stat.color}-400`} />}
                  </motion.div>
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    {stat.prefix}{formatNumber(stat.value)}+
                  </motion.div>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="features-section bg-white dark:bg-gray-800 py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage your money
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
              Our comprehensive suite of tools makes budgeting simple and effective
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index} 
                  className="text-center group"
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div 
        className="py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What our users say
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Small Business Owner",
                content: "This app transformed how I manage my business finances. The shared budgets feature is incredible!"
              },
              {
                name: "Mike Chen",
                role: "Financial Advisor",
                content: "I recommend this to all my clients. The analytics and reporting features are top-notch."
              },
              {
                name: "Emily Davis",
                role: "College Student",
                content: "Finally, a budgeting app that's actually easy to use. Helped me save $2000 this year!"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: i * 0.1 }}
                    >
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      {!user && (
        <motion.div 
          className="py-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to start your financial journey?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-base sm:text-lg">
                Join thousands of users who have taken control of their finances
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-lg transition-colors"
                >
                  <span>Start Free Today</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Home;