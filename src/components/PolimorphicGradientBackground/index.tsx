import { ReactNode } from 'react';
import {
  BackgroundChildreen,
  GradientBackground,
  GradientsContainer,
  PolimorphicShapeGreen,
  PolimorphicShapeLightBlue,
} from './styles';

interface PolimorphicGradientBackgroundProps {
  children: ReactNode;
}

export const PolimorphicGradientBackground: React.FC<PolimorphicGradientBackgroundProps> = ({ children }) => (
  <GradientBackground>
    <GradientsContainer>
      <PolimorphicShapeGreen />
      <PolimorphicShapeLightBlue />
    </GradientsContainer>
    <BackgroundChildreen>{children}</BackgroundChildreen>
  </GradientBackground>
);
