import WhatsAppWidget from './WhatsAppWidget';
import TestingWidget from './TestingWidget';
import { useFeatureFlags  } from '../contexts/FeatureFlagsContext';

export default function FloatingWidgetColumn() {
  const { flags } = useFeatureFlags();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
      
      {/* allow widgets to receive clicks */}
      <div className="pointer-events-auto flex flex-col items-end gap-4">

        {/* WhatsApp gets priority */}
        {flags.whatsappWidget && <WhatsAppWidget />}
        <TestingWidget />
      </div>
    </div>
  );
}
