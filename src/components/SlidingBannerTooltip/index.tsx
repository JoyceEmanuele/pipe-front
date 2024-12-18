import React from 'react';
import {
  MarqueeContainer, MarqueeContent, MarqueeText, TooltipContainer, TooltipText, TooltipWrapper,
} from './styled';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  maxChart: number;
  width?: string;
}

const Tooltip: React.FC<TooltipProps> = ({
  text, children, maxChart, width,
}) => (
  <TooltipContainer>
    <TooltipWrapper>
      {children}
      {text.length > maxChart && (
        <TooltipText width={width}>
          <MarqueeContainer>
            <MarqueeContent contentWidth>
              <MarqueeText>{text}</MarqueeText>
              <MarqueeText>{text}</MarqueeText>
            </MarqueeContent>
          </MarqueeContainer>
        </TooltipText>
      )}
    </TooltipWrapper>
  </TooltipContainer>
);

export default Tooltip;
