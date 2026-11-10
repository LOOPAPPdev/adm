/* Trimmed for the portfolio labs: the ten design-system components (Button, Tag, Table, RadioGroup, SegmentedControl,
   TextField, NavBar, Card, Dialog, PromoTile). The ecosystem UI kits of the original bundle are not used and are omitted. */


(() => {

const __ds_ns = (window.RiscoCognitivoDesignSystem_fab0ba = window.RiscoCognitivoDesignSystem_fab0ba || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconAfter,
  iconOnly = false,
  block = false,
  href,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const cls = ['btn', 'btn-' + variant, size === 'sm' && 'btn-sm', iconOnly && 'btn-icon', block && 'btn-block', className].filter(Boolean).join(' ');
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, icon, !iconOnly && children, iconAfter);
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    className: cls,
    href: href
  }, rest), inner);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls
  }, rest), inner);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  tone = 'neutral',
  icon,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: ['tag', 'tag-' + tone, className].filter(Boolean).join(' ')
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function Table({
  columns = [],
  rows = [],
  onRowClick
}) {
  return /*#__PURE__*/React.createElement("table", {
    className: "table"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || 'left'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id ?? i,
    onClick: onRowClick ? () => onRowClick(r) : undefined,
    style: onRowClick ? {
      cursor: 'pointer'
    } : undefined
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      color: c.muted ? 'var(--color-text-muted)' : undefined
    }
  }, c.render ? c.render(r) : r[c.key]))))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioGroup.jsx
try { (() => {
function RadioGroup({
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  label
}) {
  const [inner, setInner] = React.useState(defaultValue ?? (options[0] && options[0].value));
  const cur = value !== undefined ? value : inner;
  const lid = name + '-label';
  return /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "field-label",
    id: lid
  }, label), /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-labelledby": label ? lid : undefined,
    style: {
      display: 'grid',
      gap: 'var(--space-1)'
    }
  }, options.map(o => /*#__PURE__*/React.createElement("label", {
    className: "radio",
    key: o.value
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: o.value,
    checked: cur === o.value,
    onChange: () => {
      setInner(o.value);
      onChange && onChange(o.value);
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), o.label))));
}
Object.assign(__ds_scope, { RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function SegmentedControl({
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  ariaLabel
}) {
  const [inner, setInner] = React.useState(defaultValue ?? (options[0] && options[0].value));
  const cur = value !== undefined ? value : inner;
  return /*#__PURE__*/React.createElement("div", {
    className: "seg",
    role: "radiogroup",
    "aria-label": ariaLabel
  }, options.map(o => /*#__PURE__*/React.createElement("label", {
    className: "seg-opt",
    key: o.value
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    name: name,
    value: o.value,
    checked: cur === o.value,
    onChange: () => {
      setInner(o.value);
      onChange && onChange(o.value);
    }
  }), o.icon, o.label)));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextField({
  label,
  id,
  multiline = false,
  className = '',
  ...rest
}) {
  const fid = id || (label ? 'f-' + String(label).toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);
  const El = multiline ? 'textarea' : 'input';
  return /*#__PURE__*/React.createElement("div", {
    className: ['field', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fid
  }, label), /*#__PURE__*/React.createElement(El, _extends({
    className: "input",
    id: fid
  }, rest)));
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function NavBar({
  brand = 'Risco Cognitivo',
  logoSrc,
  links = [],
  action,
  onBrandClick,
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("nav", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("span", {
    className: "nav-brand",
    onClick: onBrandClick
  }, logoSrc && /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: ""
  }), brand), links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || '#',
    "aria-current": l.current ? 'page' : undefined,
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(l);
      }
    }
  }, l.label)), action);
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  kicker,
  title,
  body,
  meta,
  elevation,
  interactive = false,
  as = 'div',
  className = '',
  children,
  ...rest
}) {
  const El = as;
  const cls = ['card', elevation && 'elev-' + elevation, interactive && 'card-interactive', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(El, _extends({
    className: cls
  }, rest), kicker && /*#__PURE__*/React.createElement("div", {
    className: "card-kicker"
  }, kicker), title && /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, title), body && /*#__PURE__*/React.createElement("p", {
    className: "card-body"
  }, body), children, meta && /*#__PURE__*/React.createElement("div", {
    className: "card-meta"
  }, meta));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Dialog.jsx
try { (() => {
function Dialog({
  open = true,
  title,
  children,
  actions,
  onClose,
  contained = false
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "dialog-backdrop",
    style: contained ? {
      position: 'absolute'
    } : undefined,
    onClick: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dialog",
    role: "dialog",
    "aria-modal": "true"
  }, title && /*#__PURE__*/React.createElement("div", {
    className: "dialog-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "dialog-body"
  }, children), actions && /*#__PURE__*/React.createElement("div", {
    className: "dialog-actions"
  }, actions)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/PromoTile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PromoTile({
  kicker,
  title,
  body,
  actions,
  media,
  theme,
  className = '',
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['card', 'card-tile', className].filter(Boolean).join(' '),
    "data-theme": theme
  }, rest), kicker && /*#__PURE__*/React.createElement("div", {
    className: "card-kicker"
  }, kicker), title && /*#__PURE__*/React.createElement("div", {
    className: "card-title"
  }, title), body && /*#__PURE__*/React.createElement("p", {
    className: "card-body"
  }, body), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 'var(--space-2)'
    }
  }, actions), media && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-6)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center'
    }
  }, media), children);
}
Object.assign(__ds_scope, { PromoTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/PromoTile.jsx", error: String((e && e.message) || e) }); }

Object.assign(__ds_ns, __ds_scope);

})();
