import re

DNI_CONTROL_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE"
NIE_PREFIX_DIGITS = {"X": "0", "Y": "1", "Z": "2"}
NIF_CONTROL_LETTERS = "JABCDEFGHI"
NIF_LETTER_CONTROL_TYPES = "NPQRSW"
NIF_DIGIT_CONTROL_TYPES = "ABEH"

DNI_PATTERN = re.compile(r"^\d{8}[A-Z]$")
NIE_PATTERN = re.compile(r"^[XYZ]\d{7}[A-Z]$")
NIF_PATTERN = re.compile(r"^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$")


def normalize_tax_id(tax_id: str) -> str:
    return re.sub(r"[\s-]", "", tax_id).upper()


def dni_control_letter(number: str) -> str:
    return DNI_CONTROL_LETTERS[int(number) % len(DNI_CONTROL_LETTERS)]


def is_valid_dni(tax_id: str) -> bool:
    value = normalize_tax_id(tax_id)
    if not DNI_PATTERN.match(value):
        return False
    return value[-1] == dni_control_letter(value[:-1])


def is_valid_nie(tax_id: str) -> bool:
    value = normalize_tax_id(tax_id)
    if not NIE_PATTERN.match(value):
        return False
    number = NIE_PREFIX_DIGITS[value[0]] + value[1:-1]
    return value[-1] == dni_control_letter(number)


def is_valid_dni_or_nie(tax_id: str) -> bool:
    return is_valid_dni(tax_id) or is_valid_nie(tax_id)


def nif_control_digit(digits: str) -> int:
    even_positions_sum = sum(int(digit) for digit in digits[1::2])
    odd_positions_sum = sum(sum(divmod(int(digit) * 2, 10)) for digit in digits[::2])
    return (10 - (even_positions_sum + odd_positions_sum) % 10) % 10


def is_valid_nif(tax_id: str) -> bool:
    value = normalize_tax_id(tax_id)
    if not NIF_PATTERN.match(value):
        return False
    organization_type, digits, control = value[0], value[1:-1], value[-1]
    control_digit = nif_control_digit(digits)
    expected_digit = str(control_digit)
    expected_letter = NIF_CONTROL_LETTERS[control_digit]
    if organization_type in NIF_LETTER_CONTROL_TYPES:
        return control == expected_letter
    if organization_type in NIF_DIGIT_CONTROL_TYPES:
        return control == expected_digit
    return control in (expected_digit, expected_letter)