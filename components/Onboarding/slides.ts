export const getSlides = (language: 'en' | 'tl') => {
  const isTl = language === 'tl';
  return [
    {
      id: '1',
      title: isTl ? 'Maligayang pagdating' : 'Welcome to GasGuessr',
      description: isTl 
        ? 'Bantayan ang paggalaw ng presyo ng langis gamit ang aming Monte Carlo simulation engine.'
        : 'Stay ahead of fuel price fluctuations with real-time tracking and advanced Monte Carlo simulation engines.',
      image: require('../../assets/images/onboarding-1.jpg'), 
    },
    {
      id: '2',
      title: isTl ? 'Mga Salik ng Merkado' : 'Market Variables',
      description: isTl
        ? 'Baguhin ang MOPS, exchange rates, at geopolitics para makita ang epekto nito sa presyo.'
        : 'Adjust MOPS, exchange rates, and risks to see how global shifts impact local prices.',
      image: require('../../assets/images/onboarding-2.jpg'),
    },
    {
      id: '3',
      title: isTl ? 'Kalibrasyon ng Data' : 'Data Calibration',
      description: isTl
        ? 'Gumamit ng nakaraang datos o mag-adjust nang mano-mano para sa mas tumpak na pagtaya.'
        : 'Calibrate using historical GBM models or manual price adjustments for precise forecasts.',
      image: require('../../assets/images/onboarding-3.jpg'),
    },
    {
      id: '4',
      title: isTl ? 'Paano Basahin ang Resulta' : 'Reading the Results',
      description: isTl
        ? 'Ang Mean ay ang inaasahang presyo. Ang 90% Confidence Interval ay nagpapakita ng pinakamababa at pinakamataas na posibleng presyo.'
        : 'The Mean shows the average expected price. The 90% Confidence Interval shows the likely lowest and highest prices.',
      image: require('../../assets/images/onboarding-4.jpg'), 
    },
  ];
};