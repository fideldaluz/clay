/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

import classNames from 'classnames';
import ClayAutocomplete from '@clayui/autocomplete';
import ClayDropDown from '@clayui/drop-down';
import ClayForm from './Form';
import ClayIcon from '@clayui/icon';
import ClayInput from './Input';
import ClayLabel from '@clayui/label';
import React, {useLayoutEffect, useRef, useState} from 'react';
import {FocusScope, noop, sub, useFocusManagement} from '@clayui/shared';

const BACKSPACE_KEY = 8;
const COMMA_KEY = 188;
const ENTER_KEY = 13;

const DELIMITER_KEYS = [ENTER_KEY, COMMA_KEY];

export interface IProps extends React.HTMLAttributes<HTMLInputElement> {
	/**
	 * Title for the `Clear All` button.
	 */
	clearAllTitle?: string;

	/**
	 * Aria label for the Close button of the labels.
	 */
	closeButtonAriaLabel?: string;

	/**
	 * Flag that indicates to disable all features of the component.
	 */
	disabled?: boolean;

	/**
	 * Flag to disabled Clear All functionality.
	 */
	disabledClearAll?: boolean;

	/**
	 * Message to display if isValid is false.
	 */
	errorMessage?: string;

	/**
	 * Ref added to container element
	 */
	forwardRef: React.RefObject<HTMLDivElement>;

	/**
	 * Message to display which helps users interact with input
	 */
	helpText?: string;

	/**
	 * Value used for each selected item's hidden input name attribute
	 */
	inputName: string;

	/**
	 * Value of input
	 */
	inputValue: string;

	/**
	 * Values that display as label items
	 */
	items: Array<string>;

	/**
	 * Description of the input
	 */
	label?: React.ReactText;

	/**
	 * Callback for when items are added or removed
	 */
	onItemsChange: (val: Array<string>) => void;

	/**
	 * Callback for when the input value changes
	 */
	onInputChange: (val: string) => void;

	/**
	 * List of pre-populated items that will show up in a dropdown menu
	 */
	sourceItems?: Array<string>;

	/**
	 * Path to spritemap for clay icons
	 */
	spritemap?: string;

	/**
	 * Flag to indicate if input is valid or not
	 */
	isValid?: boolean;
}

const ClayMultiSelect: React.FunctionComponent<IProps> = ({
	clearAllTitle = 'Clear All',
	closeButtonAriaLabel = 'Remove {0}',
	disabled,
	disabledClearAll,
	errorMessage,
	forwardRef,
	helpText,
	inputName = '',
	inputValue = '',
	isValid = true,
	items = [],
	label,
	onBlur = noop,
	onFocus = noop,
	onInputChange,
	onItemsChange,
	onKeyDown = noop,
	onPaste = noop,
	sourceItems,
	spritemap,
	...otherProps
}) => {
	const inputRef = useRef<HTMLInputElement | null>(null);
	const lastItemRef = useRef<HTMLSpanElement | null>(null);
	const [active, setActive] = useState(false);
	const [isFocused, setIsFocused] = useState();
	const focusManager = useFocusManagement();

	useLayoutEffect(() => {
		if (sourceItems) {
			const matchedItems = sourceItems.filter(
				item => inputValue && item.match(inputValue)
			);

			setActive(matchedItems.length !== 0);
		}
	}, [sourceItems, inputValue]);

	const setNewValue = (newVal: string) => {
		onItemsChange([...items, newVal]);

		onInputChange('');
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		onKeyDown(event);

		const {keyCode} = event;

		if (inputValue && DELIMITER_KEYS.includes(keyCode)) {
			event.preventDefault();

			setNewValue(inputValue);
		} else if (
			!inputValue &&
			keyCode === BACKSPACE_KEY &&
			inputRef.current &&
			lastItemRef.current
		) {
			inputRef.current.blur();
			lastItemRef.current.focus();
		}
	};

	const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
		onPaste(event);

		const pastedText = event.clipboardData.getData('Text');

		const pastedItems = pastedText
			.split(',')
			.map(item => item.trim())
			.filter(Boolean);

		if (pastedItems.length > 0) {
			event.preventDefault();

			onItemsChange([...items, ...pastedItems]);
		}
	};

	return (
		<ClayForm.Group
			className={classNames({
				'has-error': !isValid,
			})}
			ref={forwardRef}
		>
			{label && <label>{label}</label>}

			<ClayInput.Group stacked>
				<ClayInput.GroupItem>
					<FocusScope arrowKeys={false} focusManager={focusManager}>
						<div
							className={classNames(
								'form-control form-control-tag-group input-group',
								{
									focus: isFocused && isValid,
								}
							)}
						>
							<ClayInput.GroupItem>
								{items.map((item, i) => {
									const removeItem = () =>
										onItemsChange([
											...items.slice(0, i),
											...items.slice(i + 1),
										]);

									return (
										<React.Fragment key={i}>
											<ClayLabel
												closeButtonProps={{
													'aria-label': sub(
														closeButtonAriaLabel,
														[item]
													),
													disabled,
													onClick: () => {
														if (inputRef.current) {
															inputRef.current.focus();
														}
														removeItem();
													},
													ref: ref => {
														focusManager.createScope(
															ref,
															`label${i}`
														);

														if (
															i ===
															items.length - 1
														) {
															lastItemRef.current = ref;
														}
													},
												}}
												onKeyDown={({keyCode}) => {
													if (
														keyCode !==
														BACKSPACE_KEY
													) {
														return;
													}
													if (inputRef.current) {
														inputRef.current.focus();
													}
													removeItem();
												}}
												spritemap={spritemap}
											>
												{item}
											</ClayLabel>

											<input
												name={inputName}
												type="hidden"
												value={item}
											/>
										</React.Fragment>
									);
								})}

								<input
									{...otherProps}
									className="form-control-inset"
									disabled={disabled}
									onBlur={e => {
										onBlur(e);
										setIsFocused(false);
									}}
									onChange={event =>
										onInputChange(
											event.target.value.replace(',', '')
										)
									}
									onFocus={e => {
										onFocus(e);
										setIsFocused(true);
									}}
									onKeyDown={handleKeyDown}
									onPaste={handlePaste}
									ref={ref => {
										inputRef.current = ref;
										focusManager.createScope(ref, 'input');
									}}
									type="text"
									value={inputValue}
								/>
							</ClayInput.GroupItem>

							{!disabled &&
								!disabledClearAll &&
								(inputValue || items.length > 0) && (
									<ClayInput.GroupItem shrink>
										<button
											className="component-action"
											onClick={() => {
												onItemsChange([]);

												onInputChange('');

												if (inputRef.current) {
													inputRef.current.focus();
												}
											}}
											ref={ref =>
												focusManager.createScope(
													ref,
													'clearAllButton'
												)
											}
											title={clearAllTitle}
											type="button"
										>
											<ClayIcon
												spritemap={spritemap}
												symbol="times-circle"
											/>
										</button>
									</ClayInput.GroupItem>
								)}

							{sourceItems && (
								<ClayAutocomplete.DropDown
									active={active}
									alignElementRef={forwardRef}
									onSetActive={setActive}
								>
									<ClayDropDown.ItemList>
										{sourceItems
											.filter(
												item =>
													inputValue &&
													item.match(inputValue)
											)
											.map(item => (
												<ClayAutocomplete.Item
													innerRef={ref =>
														focusManager.createScope(
															ref,
															`item${item}`,
															true
														)
													}
													key={item}
													match={inputValue}
													onClick={() => {
														onItemsChange([
															...items,
															item,
														]);

														onInputChange('');

														if (inputRef.current) {
															inputRef.current.focus();
														}
													}}
													value={item}
												/>
											))}
									</ClayDropDown.ItemList>
								</ClayAutocomplete.DropDown>
							)}
						</div>
					</FocusScope>

					{helpText && (
						<ClayForm.FeedbackGroup>
							<ClayForm.Text>{helpText}</ClayForm.Text>
						</ClayForm.FeedbackGroup>
					)}

					{!isValid && errorMessage && (
						<ClayForm.FeedbackGroup>
							<ClayForm.FeedbackItem>
								<ClayForm.FeedbackIndicator
									spritemap={spritemap}
									symbol="info-circle"
								/>

								{errorMessage}
							</ClayForm.FeedbackItem>
						</ClayForm.FeedbackGroup>
					)}
				</ClayInput.GroupItem>
			</ClayInput.Group>
		</ClayForm.Group>
	);
};

export const ClayInputWithMultiSelect = React.forwardRef<
	HTMLDivElement,
	Omit<IProps, 'forwardRef'>
>((props, ref?) => {
	const defaultRef = useRef<HTMLDivElement>(null);

	return (
		<ClayMultiSelect
			forwardRef={(ref as React.RefObject<HTMLDivElement>) || defaultRef}
			{...props}
		/>
	);
});
