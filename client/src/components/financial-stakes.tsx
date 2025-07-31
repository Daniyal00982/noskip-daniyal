import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Target, AlertTriangle } from 'lucide-react';

interface FinancialStakesProps {
  goalId: string;
  goalName: string;
  daysRemaining: number;
}

export default function FinancialStakes({ goalId, goalName, daysRemaining }: FinancialStakesProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [charity, setCharity] = useState('');
  const [hasStake, setHasStake] = useState(false);
  const [currentStake, setCurrentStake] = useState<any>(null);

  const charityOptions = [
    { value: 'doctors-without-borders', label: 'Doctors Without Borders' },
    { value: 'unicef', label: 'UNICEF' },
    { value: 'red-cross', label: 'Red Cross' },
    { value: 'oxfam', label: 'Oxfam' },
    { value: 'habitat-humanity', label: 'Habitat for Humanity' }
  ];

  const handleCreateStake = () => {
    const amount = parseInt(stakeAmount);
    if (amount >= 10 && charity) {
      setCurrentStake({
        amount,
        charity,
        createdDate: new Date(),
        daysRemaining,
        status: 'active'
      });
      setHasStake(true);
    }
  };

  if (hasStake && currentStake) {
    return (
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-destructive/10 rounded flex items-center justify-center">
            <DollarSign className="w-3 h-3 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground tracking-tight">Financial Stakes</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">ACTIVE STAKE</span>
            </div>
            <div className="text-2xl font-bold text-foreground">${currentStake.amount}</div>
            <div className="text-xs text-muted-foreground">
              Goes to {charityOptions.find(c => c.value === currentStake.charity)?.label} if you fail
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground">{daysRemaining}</div>
              <div className="text-xs text-muted-foreground tracking-wide">DAYS LEFT</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">${currentStake.amount + 10}</div>
              <div className="text-xs text-muted-foreground tracking-wide">WIN BONUS</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/50 rounded">
            Complete your goal to get your money back + $10 bonus
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
          <Target className="w-3 h-3 text-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground tracking-tight">Financial Stakes</h3>
      </div>

      <div className="space-y-4">
        <div className="text-xs text-muted-foreground mb-3">
          Put real money on your goal. 85% higher success rate with financial commitment.
        </div>

        <div>
          <Label htmlFor="stake-amount" className="text-xs font-medium text-muted-foreground tracking-wide">
            STAKE AMOUNT
          </Label>
          <Input
            id="stake-amount"
            type="number"
            placeholder="50"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="mt-1"
            min="10"
            max="500"
          />
          <div className="text-xs text-muted-foreground mt-1">Minimum $10, Maximum $500</div>
        </div>

        <div>
          <Label htmlFor="charity" className="text-xs font-medium text-muted-foreground tracking-wide">
            CHARITY (IF YOU FAIL)
          </Label>
          <Select value={charity} onValueChange={setCharity}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose charity" />
            </SelectTrigger>
            <SelectContent>
              {charityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-3 bg-muted/50 rounded">
          <div className="text-xs font-medium text-foreground mb-1">How it works:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Your money is held securely</li>
            <li>• Complete goal: Get money back + $10 bonus</li>
            <li>• Fail goal: Money goes to chosen charity</li>
          </ul>
        </div>

        <Button 
          onClick={handleCreateStake}
          disabled={!stakeAmount || parseInt(stakeAmount) < 10 || !charity}
          className="w-full btn-premium"
        >
          CREATE STAKE
        </Button>
      </div>
    </div>
  );
}