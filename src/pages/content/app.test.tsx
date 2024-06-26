import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@root/src/pages/content/Menu';

describe('appTest', () => {
  test('render text', () => {
    // given
    const text = 'content view';

    // when
    render(<App />);

    // then
    screen.getByText(text);
  });
});
