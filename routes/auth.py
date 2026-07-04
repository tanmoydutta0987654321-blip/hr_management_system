from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
from db import execute_query

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signin', methods=['GET'])
@auth_bp.route('/signin.html', methods=['GET'])
@auth_bp.route('/login', methods=['GET'])
def signin():
    if session.get('user_id'):
        return redirect(url_for('dashboard.dashboard'))
    return render_template('signin.html')


@auth_bp.route('/signin', methods=['POST'])
def signin_post():
    email = request.form.get('email', '').strip()
    password = request.form.get('password', '').strip()

    if not email or not password:
        flash('Please enter both email and password.', 'error')
        return render_template('signin.html')

    user = execute_query(
        "SELECT id, employee_id, email, role, password FROM users WHERE email = %s",
        (email,), fetch_one=True
    )

    if user is None or not check_password_hash(user['password'], password):
        flash('Invalid email or password.', 'error')
        return render_template('signin.html')

    # Get employee record
    employee = execute_query(
        "SELECT id, first_name, last_name FROM employees WHERE user_id = %s",
        (user['id'],), fetch_one=True
    )

    # Set session
    session['user_id'] = user['id']
    session['employee_id'] = employee['id'] if employee else None
    session['emp_code'] = user['employee_id']
    session['email'] = user['email']
    session['role'] = user['role']
    session['first_name'] = employee['first_name'] if employee else ''
    session['last_name'] = employee['last_name'] if employee else ''

    flash(f"Welcome back, {session['first_name']}!", 'success')
    return redirect(url_for('dashboard.dashboard'))


@auth_bp.route('/signup', methods=['GET'])
@auth_bp.route('/sign_up.html', methods=['GET'])
def signup():
    if session.get('user_id'):
        return redirect(url_for('dashboard.dashboard'))
    return render_template('sign_up.html')


@auth_bp.route('/signup', methods=['POST'])
def signup_post():
    employee_id = request.form.get('employee_id', '').strip()
    email = request.form.get('email', '').strip()
    role = request.form.get('role', 'employee').strip()
    password = request.form.get('password', '').strip()
    confirm_password = request.form.get('confirm_password', '').strip()
    first_name = request.form.get('first_name', '').strip()
    last_name = request.form.get('last_name', '').strip()
    gender = request.form.get('gender', '').strip()
    phone = request.form.get('phone', '').strip()
    address = request.form.get('address', '').strip()

    # Server-side validation
    errors = []
    if not employee_id:
        errors.append('Employee ID is required.')
    if not email or '@' not in email:
        errors.append('A valid email is required.')
    if role not in ('employee', 'hr_manager'):
        errors.append('Invalid role selected.')
    if not password or len(password) < 8:
        errors.append('Password must be at least 8 characters.')
    if password != confirm_password:
        errors.append('Passwords do not match.')
    if not first_name:
        errors.append('First name is required.')
    if not last_name:
        errors.append('Last name is required.')

    if errors:
        for err in errors:
            flash(err, 'error')
        return render_template('sign_up.html')

    # Check for duplicates
    existing = execute_query(
        "SELECT id FROM users WHERE employee_id = %s OR email = %s",
        (employee_id, email), fetch_one=True
    )
    if existing:
        flash('An account with this Employee ID or email already exists.', 'error')
        return render_template('sign_up.html')

    # Hash password and insert user
    hashed_password = generate_password_hash(password)
    user_id = execute_query(
        "INSERT INTO users (employee_id, email, role, password) VALUES (%s, %s, %s, %s)",
        (employee_id, email, role, hashed_password), commit=True
    )

    if user_id is None:
        flash('Registration failed. Please try again.', 'error')
        return render_template('sign_up.html')

    # Insert employee record
    emp_id = execute_query(
        "INSERT INTO employees (user_id, first_name, last_name, gender, phone, address) VALUES (%s, %s, %s, %s, %s, %s)",
        (user_id, first_name, last_name, gender, phone, address), commit=True
    )

    if emp_id is None:
        flash('Profile creation failed. Please contact support.', 'error')
        return render_template('sign_up.html')

    # Initialize salary record with defaults
    execute_query(
        "INSERT INTO salary (employee_id, basic_salary, bonus, deduction) VALUES (%s, 0.00, 0.00, 0.00)",
        (emp_id,), commit=True
    )

    flash('Account created successfully! Please sign in.', 'success')
    return redirect(url_for('auth.signin'))


@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('home'))
