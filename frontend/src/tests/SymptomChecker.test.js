import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SymptomChecker from '../components/patient/SymptomChecker';
import { aiService } from '../services';

jest.mock('../services', () => ({
  aiService: { analyze: jest.fn() }
}));

jest.mock('react-hot-toast', () => ({ error: jest.fn() }));

describe('SymptomChecker', () => {
  afterEach(() => jest.clearAllMocks());

  test('renders symptom buttons', () => {
    render(<SymptomChecker />);
    expect(screen.getByText('fever')).toBeInTheDocument();
    expect(screen.getByText('cough')).toBeInTheDocument();
  });

  test('toggles symptom selection', () => {
    render(<SymptomChecker />);
    const btn = screen.getByText('fever');
    fireEvent.click(btn);
    expect(btn.className).toContain('bg-primary-600');
    fireEvent.click(btn);
    expect(btn.className).not.toContain('bg-primary-600');
  });

  test('shows analysis result on submit', async () => {
    aiService.analyze.mockResolvedValue({
      data: {
        urgency: 'low',
        diseases: [{ name: 'Common Cold', probability: 0.8 }],
        recommendations: ['Rest and hydrate'],
        emergency_escalate: false
      }
    });

    render(<SymptomChecker />);
    fireEvent.click(screen.getByText('fever'));
    fireEvent.click(screen.getByText('Analyze Symptoms'));

    await waitFor(() => expect(screen.getByText('Analysis Result')).toBeInTheDocument());
    expect(screen.getByText('Common Cold')).toBeInTheDocument();
    expect(screen.getByText('Rest and hydrate')).toBeInTheDocument();
  });

  test('shows emergency alert for critical urgency', async () => {
    aiService.analyze.mockResolvedValue({
      data: {
        urgency: 'critical',
        diseases: [],
        recommendations: [],
        emergency_escalate: true
      }
    });

    render(<SymptomChecker />);
    fireEvent.click(screen.getByText('chest pain'));
    fireEvent.click(screen.getByText('Analyze Symptoms'));

    await waitFor(() => expect(screen.getByText(/Emergency! Call 108/)).toBeInTheDocument());
  });
});
