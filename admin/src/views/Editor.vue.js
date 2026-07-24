import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import { usePostsStore } from '../stores/posts';
const props = defineProps();
const router = useRouter();
const postsStore = usePostsStore();
const isEdit = computed(() => !!props.id);
const editorRef = ref(null);
const saving = ref(false);
const uploadUrl = '/api/upload';
const uploadHeaders = computed(() => ({
    Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}`,
}));
const form = reactive({
    title: '',
    content: '',
    tags: [],
    cover: '',
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    subtitle: '',
    summary: '',
});
const renderedPreview = computed(() => {
    if (!form.content)
        return '';
    return marked.parse(form.content);
});
onMounted(async () => {
    if (props.id) {
        try {
            const post = await postsStore.fetchPost(props.id);
            form.title = post.meta.title || post.title;
            form.content = post.content;
            form.tags = post.meta.tags || [];
            form.cover = post.meta.cover || '';
            form.status = post.meta.status || 'draft';
            form.date = post.meta.date || '';
            form.subtitle = post.meta.subtitle || '';
            form.summary = post.meta.summary || '';
        }
        catch {
            ElMessage.error('Failed to load post');
            router.push('/posts');
        }
    }
});
async function handleSave(status) {
    if (!form.title.trim()) {
        ElMessage.warning('Please enter a title');
        return;
    }
    saving.value = true;
    form.status = status;
    try {
        const payload = {
            title: form.title.trim(),
            content: form.content,
            tags: form.tags,
            cover: form.cover,
            status: form.status,
            date: form.date,
            subtitle: form.subtitle,
            summary: form.summary,
        };
        if (isEdit.value && props.id) {
            await postsStore.updatePost(props.id, payload);
            ElMessage.success('Post updated');
        }
        else {
            await postsStore.createPost(payload);
            ElMessage.success('Post created');
        }
        router.push('/posts');
    }
    catch {
        // Error handled by interceptor
    }
    finally {
        saving.value = false;
    }
}
function handleUploadSuccess(response) {
    const markdown = `![image](${response.url})`;
    // Insert at cursor or append
    const el = editorRef.value;
    if (el) {
        const start = el.selectionStart;
        const end = el.selectionEnd;
        form.content = form.content.slice(0, start) + markdown + form.content.slice(end);
    }
    else {
        form.content += markdown;
    }
    ElMessage.success('Image uploaded! Markdown inserted at cursor.');
}
function beforeUpload(file) {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error('Only image files are allowed');
        return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
        ElMessage.error('Image must be smaller than 5MB');
        return false;
    }
    return true;
}
// Handle paste events so pasted images can be detected (basic text paste works fine)
function handlePaste(_e) {
    // Text paste works natively via v-model
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['md-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "editor-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
(__VLS_ctx.isEdit ? 'Edit Post' : 'New Post');
const __VLS_0 = {}.ElSpace;
/** @type {[typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.$router.back();
    }
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.form.status === 'publish' ? 'success' : 'warning'),
    loading: (__VLS_ctx.saving),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: (__VLS_ctx.form.status === 'publish' ? 'success' : 'warning'),
    loading: (__VLS_ctx.saving),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.handleSave(__VLS_ctx.form.status);
    }
};
__VLS_15.slots.default;
(__VLS_ctx.form.status === 'publish' ? 'Publish' : 'Save Draft');
var __VLS_15;
var __VLS_3;
const __VLS_20 = {}.ElRow;
/** @type {[typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    gutter: (20),
}));
const __VLS_22 = __VLS_21({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    span: (18),
}));
const __VLS_26 = __VLS_25({
    span: (18),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
const __VLS_28 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    shadow: "hover",
    ...{ class: "editor-card" },
}));
const __VLS_30 = __VLS_29({
    shadow: "hover",
    ...{ class: "editor-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
const __VLS_32 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    labelPosition: "top",
}));
const __VLS_34 = __VLS_33({
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
const __VLS_36 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    label: "Title",
}));
const __VLS_38 = __VLS_37({
    label: "Title",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
const __VLS_40 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "Enter post title...",
    size: "large",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.form.title),
    placeholder: "Enter post title...",
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
var __VLS_39;
const __VLS_44 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    label: "Content",
}));
const __VLS_46 = __VLS_45({
    label: "Content",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_47.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    ...{ onPaste: (__VLS_ctx.handlePaste) },
    ref: "editorRef",
    value: (__VLS_ctx.form.content),
    ...{ class: "md-editor" },
    placeholder: "Write your markdown content here...",
});
/** @type {typeof __VLS_ctx.editorRef} */ ;
var __VLS_47;
var __VLS_35;
var __VLS_31;
if (__VLS_ctx.form.content) {
    const __VLS_48 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        shadow: "hover",
        ...{ class: "preview-card" },
    }));
    const __VLS_50 = __VLS_49({
        shadow: "hover",
        ...{ class: "preview-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_51.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "markdown-preview" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.renderedPreview) }, null, null);
    var __VLS_51;
}
var __VLS_27;
const __VLS_52 = {}.ElCol;
/** @type {[typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    span: (6),
}));
const __VLS_54 = __VLS_53({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
const __VLS_56 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    shadow: "hover",
    ...{ class: "meta-card" },
}));
const __VLS_58 = __VLS_57({
    shadow: "hover",
    ...{ class: "meta-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_59.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
const __VLS_60 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    labelPosition: "top",
    size: "small",
}));
const __VLS_62 = __VLS_61({
    labelPosition: "top",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
const __VLS_64 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    label: "Status",
}));
const __VLS_66 = __VLS_65({
    label: "Status",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
const __VLS_68 = {}.ElRadioGroup;
/** @type {[typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, typeof __VLS_components.ElRadioGroup, typeof __VLS_components.elRadioGroup, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.form.status),
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.form.status),
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    value: "publish",
}));
const __VLS_74 = __VLS_73({
    value: "publish",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
__VLS_75.slots.default;
var __VLS_75;
const __VLS_76 = {}.ElRadio;
/** @type {[typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, typeof __VLS_components.ElRadio, typeof __VLS_components.elRadio, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    value: "draft",
}));
const __VLS_78 = __VLS_77({
    value: "draft",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
__VLS_79.slots.default;
var __VLS_79;
var __VLS_71;
var __VLS_67;
const __VLS_80 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    label: "Date",
}));
const __VLS_82 = __VLS_81({
    label: "Date",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_83.slots.default;
const __VLS_84 = {}.ElDatePicker;
/** @type {[typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.form.date),
    type: "date",
    placeholder: "Select date",
    ...{ style: {} },
    valueFormat: "YYYY-MM-DD",
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.form.date),
    type: "date",
    placeholder: "Select date",
    ...{ style: {} },
    valueFormat: "YYYY-MM-DD",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_83;
const __VLS_88 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
    label: "Tags",
}));
const __VLS_90 = __VLS_89({
    label: "Tags",
}, ...__VLS_functionalComponentArgsRest(__VLS_89));
__VLS_91.slots.default;
const __VLS_92 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.form.tags),
    multiple: true,
    filterable: true,
    allowCreate: true,
    defaultFirstOption: true,
    placeholder: "Add tags...",
    ...{ style: {} },
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.form.tags),
    multiple: true,
    filterable: true,
    allowCreate: true,
    defaultFirstOption: true,
    placeholder: "Add tags...",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
var __VLS_91;
const __VLS_96 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "Cover Image URL",
}));
const __VLS_98 = __VLS_97({
    label: "Cover Image URL",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    modelValue: (__VLS_ctx.form.cover),
    placeholder: "/images/cover.jpg",
}));
const __VLS_102 = __VLS_101({
    modelValue: (__VLS_ctx.form.cover),
    placeholder: "/images/cover.jpg",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
var __VLS_99;
const __VLS_104 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "Subtitle",
}));
const __VLS_106 = __VLS_105({
    label: "Subtitle",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
const __VLS_108 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.form.subtitle),
    placeholder: "Optional subtitle",
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.form.subtitle),
    placeholder: "Optional subtitle",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
var __VLS_107;
const __VLS_112 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "Summary",
}));
const __VLS_114 = __VLS_113({
    label: "Summary",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.form.summary),
    type: "textarea",
    rows: (3),
    placeholder: "Brief summary...",
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.form.summary),
    type: "textarea",
    rows: (3),
    placeholder: "Brief summary...",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
var __VLS_115;
const __VLS_120 = {}.ElDivider;
/** @type {[typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({}));
const __VLS_122 = __VLS_121({}, ...__VLS_functionalComponentArgsRest(__VLS_121));
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "Image Upload",
}));
const __VLS_126 = __VLS_125({
    label: "Image Upload",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElUpload;
/** @type {[typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, typeof __VLS_components.ElUpload, typeof __VLS_components.elUpload, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    action: (__VLS_ctx.uploadUrl),
    headers: (__VLS_ctx.uploadHeaders),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleUploadSuccess),
    beforeUpload: (__VLS_ctx.beforeUpload),
    accept: "image/*",
}));
const __VLS_130 = __VLS_129({
    action: (__VLS_ctx.uploadUrl),
    headers: (__VLS_ctx.uploadHeaders),
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleUploadSuccess),
    beforeUpload: (__VLS_ctx.beforeUpload),
    accept: "image/*",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
const __VLS_132 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    type: "primary",
    size: "small",
}));
const __VLS_134 = __VLS_133({
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
const __VLS_136 = {}.ElIcon;
/** @type {[typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({}));
const __VLS_138 = __VLS_137({}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.Upload;
/** @type {[typeof __VLS_components.Upload, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({}));
const __VLS_142 = __VLS_141({}, ...__VLS_functionalComponentArgsRest(__VLS_141));
var __VLS_139;
var __VLS_135;
var __VLS_131;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "upload-hint" },
});
var __VLS_127;
var __VLS_63;
var __VLS_59;
var __VLS_55;
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['editor-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['editor-card']} */ ;
/** @type {__VLS_StyleScopedClasses['md-editor']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown-preview']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-card']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-hint']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isEdit: isEdit,
            editorRef: editorRef,
            saving: saving,
            uploadUrl: uploadUrl,
            uploadHeaders: uploadHeaders,
            form: form,
            renderedPreview: renderedPreview,
            handleSave: handleSave,
            handleUploadSuccess: handleUploadSuccess,
            beforeUpload: beforeUpload,
            handlePaste: handlePaste,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
