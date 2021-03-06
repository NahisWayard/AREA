package com.b12powered.area

import android.text.InputType

/**
 * A class needed by [EditTextListAdapter] to allow EditText's value edition even after inflating the adapter in view
 */
class EditModel {
    private lateinit var editTextValue: String
    private lateinit var editTextHint: String
    private var editTextInputType: Int = InputType.TYPE_CLASS_TEXT

    /**
     * [editTextValue] getter
     *
     * @return The [editTextValue] or an empty string if it has not been initialized at the time of the call
     */
    fun getEditTextValue(): String {
        if (::editTextValue.isInitialized)
            return editTextValue
        return ""
    }

    /**
     * [editTextValue] setter
     *
     * @param value The new value to assign to [editTextValue]
     */
    fun setEditTextValue(value: String) {
        editTextValue = value
    }

    /**
     * [editTextHint] getter
     *
     * @return The [editTextHint] or an empty string if it has not been initialized at the time of the call
     */
    fun getEditTextHint(): String {
        if (::editTextHint.isInitialized)
            return editTextHint
        return ""
    }

    /**
     * [editTextHint] setter
     *
     * @param value The new value to assign to [editTextHint]
     */
    fun setEditTextHint(value: String) {
        editTextHint = value
    }

    /**
     * [editTextInputType] getter
     *
     * @return The [editTextInputType]
     */
    fun getEditTextInputType(): Int {
        return editTextInputType
    }

    /**
     * [editTextInputType] setter
     *
     * @param value The new value to assign to [editTextInputType]
     */
    fun setEditTextInputType(value: Int) {
        editTextInputType = value
    }
}