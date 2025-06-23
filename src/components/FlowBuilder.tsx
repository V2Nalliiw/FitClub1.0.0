import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ThemeToggle from "@/components/auth/ThemeToggle";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  UserCheck,
  Workflow,
  MessageSquare,
  TrendingUp,
  Users,
  Settings,
  Calendar,
  FileText,
  Plus,
  Edit,
  Shield,
  Activity,
  Upload,
  Trash2,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Save,
  Eye,
  Copy,
  HelpCircle,
  Check,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  ListChecks,
  BarChart3,
  ToggleLeft,
  GitBranch,
  CheckCircle,
  Video,
  Headphones,
  BookOpen,
  Music,
  Zap,
  Link,
  Unlink,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Download,
  FolderOpen,
  Maximize2,
  Minimize2,
  Smile,
  Image,
  Circle,
  CheckSquare,
  Monitor,
  Clock,
} from "lucide-react";

// Enhanced Custom Node Components with better connection visualization

const StartNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`start-title-${id}`);
    const subtitleInput = document.getElementById(`start-subtitle-${id}`);
    const messageInput = document.getElementById(`start-message-${id}`);
    const mediaTypeSelect = document.getElementById(`start-media-type-${id}`);
    const mediaUrlInput = document.getElementById(`start-media-url-${id}`);
    const enableTimerCheckbox = document.getElementById(
      `start-enable-timer-${id}`,
    );
    const timerAmountInput = document.getElementById(
      `start-timer-amount-${id}`,
    );
    const timerUnitSelect = document.getElementById(`start-timer-unit-${id}`);
    const showContinueButtonCheckbox = document.getElementById(
      `start-show-continue-${id}`,
    );
    const isLinkedFlowCheckbox = document.getElementById(
      `start-is-linked-flow-${id}`,
    );
    const sourceFlowIdInput = document.getElementById(
      `start-source-flow-id-${id}`,
    );

    if (
      titleInput &&
      subtitleInput &&
      messageInput &&
      mediaTypeSelect &&
      mediaUrlInput &&
      enableTimerCheckbox &&
      timerAmountInput &&
      timerUnitSelect &&
      showContinueButtonCheckbox &&
      isLinkedFlowCheckbox &&
      sourceFlowIdInput
    ) {
      updateNodeData({
        label: titleInput.value || "Início",
        subtitle: subtitleInput.value || "",
        message: messageInput.value || "Início do fluxo",
        mediaType: mediaTypeSelect.value,
        mediaUrl: mediaUrlInput.value || "",
        enableTimer: enableTimerCheckbox.checked || false,
        timerAmount: parseInt(timerAmountInput.value) || 1,
        timerUnit: timerUnitSelect.value || "hours",
        showContinueButton: showContinueButtonCheckbox.checked || false,
        isLinkedFlow: isLinkedFlowCheckbox.checked || false,
        sourceFlowId: sourceFlowIdInput.value || "",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  const renderMediaPreview = () => {
    if (!data.mediaUrl) return null;

    switch (data.mediaType) {
      case "image":
        return (
          <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
            <div className="h-24 flex items-center justify-center">
              <Image className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-xs text-gray-500">
                Imagem configurada
              </span>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
            <div className="h-24 flex items-center justify-center">
              <Video className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-xs text-gray-500">
                Vídeo configurado
              </span>
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="mt-3 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
            <div className="h-12 flex items-center justify-center">
              <Music className="h-6 w-6 text-gray-400" />
              <span className="ml-2 text-xs text-gray-500">
                Áudio configurado
              </span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-emerald-500 shadow-emerald-200"
            : "border-emerald-200 dark:border-emerald-800"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Play className="h-4 w-4 mr-2 text-emerald-500" />
            {data.label || "Início"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        {data.subtitle && (
          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">
            {data.subtitle}
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.message || "Início do fluxo"}
        </div>

        {renderMediaPreview()}

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Timer indicator */}
        {data.enableTimer && (
          <div className="mt-3 p-2 bg-emerald-100 dark:bg-emerald-800/30 rounded border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center text-xs text-emerald-700 dark:text-emerald-300">
              <Clock className="h-3 w-3 mr-1" />
              Timer: {data.timerAmount}{" "}
              {data.timerUnit === "minutes"
                ? "min"
                : data.timerUnit === "hours"
                  ? "h"
                  : data.timerUnit === "days"
                    ? "d"
                    : "sem"}
            </div>
            {data.showContinueButton && (
              <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                <ArrowRight className="h-3 w-3 mr-1" />
                Botão continuar habilitado
              </div>
            )}
          </div>
        )}

        {/* Linked flow indicator */}
        {data.isLinkedFlow && data.sourceFlowId && (
          <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-800/30 rounded border border-purple-200 dark:border-purple-700">
            <div className="flex items-center text-xs text-purple-700 dark:text-purple-300">
              <GitBranch className="h-3 w-3 mr-1" />
              Vinculado ao fluxo: {data.sourceFlowId}
            </div>
          </div>
        )}

        {/* Input Handle for linked flows */}
        {(data.isLinkedFlow || showConnectionPoints) && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-emerald-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Página de Início</DialogTitle>
            <DialogDescription>
              Configure as propriedades da página inicial do fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor={`start-title-${id}`}>Título</Label>
              <Input
                id={`start-title-${id}`}
                defaultValue={data.label || "Início"}
                placeholder="Título da página inicial"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`start-subtitle-${id}`}>Subtítulo</Label>
              <Input
                id={`start-subtitle-${id}`}
                defaultValue={data.subtitle || ""}
                placeholder="Subtítulo (opcional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`start-message-${id}`}>Texto</Label>
              <Textarea
                id={`start-message-${id}`}
                defaultValue={data.message || "Início do fluxo"}
                placeholder="Texto de apresentação"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Mídia</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`start-media-type-${id}`}
                    className="text-sm text-gray-500 mb-1 block"
                  >
                    Tipo
                  </Label>
                  <Select
                    defaultValue={data.mediaType || "none"}
                    onValueChange={(value) =>
                      handleInputChange("mediaType", value)
                    }
                    name={`start-media-type-${id}`}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label
                    htmlFor={`start-media-url-${id}`}
                    className="text-sm text-gray-500 mb-1 block"
                  >
                    URL
                  </Label>
                  <Input
                    id={`start-media-url-${id}`}
                    defaultValue={data.mediaUrl || ""}
                    placeholder="URL da mídia"
                  />
                </div>
              </div>
            </div>

            {/* Timer Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`start-enable-timer-${id}`}
                  defaultChecked={data.enableTimer || false}
                />
                <Label
                  htmlFor={`start-enable-timer-${id}`}
                  className="flex items-center"
                >
                  <Clock className="h-4 w-4 mr-2 text-emerald-500" />
                  Habilitar Temporizador Automático
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor={`start-timer-amount-${id}`}
                    className="text-sm text-gray-500 mb-1 block"
                  >
                    Quantidade
                  </Label>
                  <Input
                    id={`start-timer-amount-${id}`}
                    type="number"
                    min="1"
                    max="999"
                    defaultValue={data.timerAmount || 1}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label
                    htmlFor={`start-timer-unit-${id}`}
                    className="text-sm text-gray-500 mb-1 block"
                  >
                    Unidade
                  </Label>
                  <Select
                    defaultValue={data.timerUnit || "hours"}
                    onValueChange={(value) =>
                      handleInputChange("timerUnit", value)
                    }
                  >
                    <SelectTrigger id={`start-timer-unit-${id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutos</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                      <SelectItem value="weeks">Semanas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`start-show-continue-${id}`}
                  defaultChecked={data.showContinueButton || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("showContinueButton", checked)
                  }
                />
                <Label
                  htmlFor={`start-show-continue-${id}`}
                  className="flex items-center"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  Mostrar Botão "Continuar" para o Paciente
                </Label>
              </div>

              {/* Linked Flow Configuration */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`start-is-linked-flow-${id}`}
                    defaultChecked={data.isLinkedFlow || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("isLinkedFlow", checked)
                    }
                  />
                  <Label
                    htmlFor={`start-is-linked-flow-${id}`}
                    className="flex items-center"
                  >
                    <GitBranch className="h-4 w-4 mr-2 text-purple-500" />
                    Este é um fluxo vinculado
                  </Label>
                </div>

                <div className="space-y-2 mt-2">
                  <Label htmlFor={`start-source-flow-id-${id}`}>
                    ID do Fluxo de Origem
                  </Label>
                  <Input
                    id={`start-source-flow-id-${id}`}
                    defaultValue={data.sourceFlowId || ""}
                    placeholder="ID do fluxo de origem"
                    onChange={(e) =>
                      handleInputChange("sourceFlowId", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">
                      Como funciona o temporizador:
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • O fluxo aguardará o tempo configurado antes de
                        continuar automaticamente
                      </li>
                      <li>
                        • Útil para criar intervalos entre etapas (ex: aguardar
                        1 dia antes do próximo questionário)
                      </li>
                      <li>
                        • O botão "Continuar" permite que o paciente prossiga
                        antes do tempo, se habilitado
                      </li>
                      <li>
                        • Conecte este nó a um nó "Fim" para marcar o final de
                        uma etapa
                      </li>
                      <li>
                        • Marque como "fluxo vinculado" para receber conexões de
                        outros fluxos
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const QuestionNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);
  const [options, setOptions] = useState(
    data.options || ["Opção 1", "Opção 2"],
  );
  const [questionType, setQuestionType] = useState(
    data.questionType || "single",
  );
  const [useEmojis, setUseEmojis] = useState(data.useEmojis || false);
  const [useImages, setUseImages] = useState(data.useImages || false);
  const [allowTextInput, setAllowTextInput] = useState(
    data.allowTextInput || false,
  );
  const [textInputOnly, setTextInputOnly] = useState(
    data.textInputOnly || false,
  );

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`question-title-${id}`);
    const questionInput = document.getElementById(`question-text-${id}`);

    if (titleInput && questionInput) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Pergunta",
        question:
          (questionInput as HTMLTextAreaElement).value ||
          "Qual é a sua pergunta?",
        options: options,
        questionType: questionType,
        useEmojis: useEmojis,
        useImages: useImages,
        allowTextInput: allowTextInput,
        textInputOnly: textInputOnly,
      });
    }
    setShowEditModal(false);
  };

  const addOption = () => {
    setOptions([...options, `Opção ${options.length + 1}`]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Toggle text input only mode
  const handleTextInputOnlyChange = (checked) => {
    setTextInputOnly(checked);
    if (checked) {
      setAllowTextInput(true);
    }
    // Auto-save
    updateNodeData({
      ...data,
      textInputOnly: checked,
      allowTextInput: checked ? true : allowTextInput,
    });
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  // Auto-save on state changes
  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
    updateNodeData({
      ...data,
      questionType: value,
    });
  };

  const handleUseEmojisChange = (checked) => {
    setUseEmojis(checked);
    updateNodeData({
      ...data,
      useEmojis: checked,
    });
  };

  const handleUseImagesChange = (checked) => {
    setUseImages(checked);
    updateNodeData({
      ...data,
      useImages: checked,
    });
  };

  const handleAllowTextInputChange = (checked) => {
    setAllowTextInput(checked);
    updateNodeData({
      ...data,
      allowTextInput: checked,
    });
  };

  const handleOptionsChange = (newOptions) => {
    setOptions(newOptions);
    updateNodeData({
      ...data,
      options: newOptions,
    });
  };

  return (
    <>
      <div
        className={`bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-blue-500 shadow-blue-200"
            : "border-blue-200 dark:border-blue-800"
        }`}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-blue-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
            {data.label || "Pergunta"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.question || "Qual é a sua pergunta?"}
        </div>

        <div className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded mb-3 flex items-center">
          {data.textInputOnly ? (
            <>
              <Edit className="h-3 w-3 mr-1" />
              Resposta Digitada
            </>
          ) : (
            <>
              {data.questionType === "multiple" ? (
                <CheckSquare className="h-3 w-3 mr-1" />
              ) : (
                <Circle className="h-3 w-3 mr-1" />
              )}
              {data.questionType === "multiple"
                ? "Múltipla Escolha"
                : "Escolha Única"}
              {data.useEmojis && <Smile className="h-3 w-3 ml-2" />}
              {data.useImages && <Image className="h-3 w-3 ml-2" />}
              {data.allowTextInput && !data.textInputOnly && (
                <Edit className="h-3 w-3 ml-2" />
              )}
            </>
          )}
        </div>

        {/* Options display or text input field */}
        {data.textInputOnly ? (
          <div className="bg-white dark:bg-gray-800 p-3 rounded border mb-3">
            <div className="flex items-center">
              <Edit className="h-4 w-4 mr-2 text-blue-500" />
              <span className="text-sm text-gray-500">
                Campo para resposta digitada
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 mb-3">
            {(data.options || ["Opção 1", "Opção 2"]).map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border"
              >
                <div className="flex items-center">
                  {data.questionType === "multiple" ? (
                    <CheckSquare className="h-3 w-3 mr-2 text-blue-500" />
                  ) : (
                    <Circle className="h-3 w-3 mr-2 text-blue-500" />
                  )}
                  <span className="text-sm">{option}</span>
                  {data.useEmojis && <span className="ml-2">😊</span>}
                  {data.useImages && (
                    <Image className="h-3 w-3 ml-2 text-gray-400" />
                  )}
                </div>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`option-${index}`}
                  className="w-2 h-2 bg-blue-500 border border-white relative"
                  style={{ right: "-6px" }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        {/* Single output handle for text-input-only questions */}
        {data.textInputOnly && (
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-blue-500 border-2 border-white"
          />
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pergunta</DialogTitle>
            <DialogDescription>
              Configure as opções e propriedades da pergunta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor={`question-title-${id}`}>Título</Label>
              <Input
                id={`question-title-${id}`}
                defaultValue={data.label || "Pergunta"}
                placeholder="Título da pergunta"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`question-text-${id}`}>Texto da Pergunta</Label>
              <Textarea
                id={`question-text-${id}`}
                defaultValue={data.question || "Qual é a sua pergunta?"}
                placeholder="Digite a pergunta aqui"
                rows={3}
                onChange={(e) => handleInputChange("question", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Resposta</Label>
              <Select
                value={questionType}
                onValueChange={handleQuestionTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Escolha Única</SelectItem>
                  <SelectItem value="multiple">Múltipla Escolha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`use-emojis-${id}`}
                  checked={useEmojis}
                  onCheckedChange={handleUseEmojisChange}
                />
                <Label
                  htmlFor={`use-emojis-${id}`}
                  className="flex items-center"
                >
                  <Smile className="h-4 w-4 mr-1" />
                  Emojis
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`use-images-${id}`}
                  checked={useImages}
                  onCheckedChange={handleUseImagesChange}
                />
                <Label
                  htmlFor={`use-images-${id}`}
                  className="flex items-center"
                >
                  <Image className="h-4 w-4 mr-1" />
                  Imagens
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`allow-text-input-${id}`}
                  checked={allowTextInput}
                  onCheckedChange={handleAllowTextInputChange}
                  disabled={textInputOnly}
                />
                <Label
                  htmlFor={`allow-text-input-${id}`}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Permitir resposta digitada
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`text-input-only-${id}`}
                  checked={textInputOnly}
                  onCheckedChange={handleTextInputOnlyChange}
                />
                <Label
                  htmlFor={`text-input-only-${id}`}
                  className="flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Somente resposta digitada
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opções de Resposta</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newOptions = [
                      ...options,
                      `Opção ${options.length + 1}`,
                    ];
                    handleOptionsChange(newOptions);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...options];
                        newOptions[index] = e.target.value;
                        handleOptionsChange(newOptions);
                      }}
                      placeholder={`Opção ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (options.length > 2) {
                            const newOptions = options.filter(
                              (_, i) => i !== index,
                            );
                            handleOptionsChange(newOptions);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const MessageNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`message-title-${id}`);
    const messageInput = document.getElementById(`message-text-${id}`);

    if (titleInput && messageInput) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Mensagem",
        message:
          (messageInput as HTMLTextAreaElement).value || "Conteúdo da mensagem",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  return (
    <>
      <div
        className={`bg-green-50 dark:bg-green-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-green-500 shadow-green-200"
            : "border-green-200 dark:border-green-800"
        }`}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-green-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
            {data.label || "Mensagem"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.message || "Conteúdo da mensagem"}
        </div>

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-green-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mensagem</DialogTitle>
            <DialogDescription>
              Configure o conteúdo da mensagem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`message-title-${id}`}>Título</Label>
              <Input
                id={`message-title-${id}`}
                defaultValue={data.label || "Mensagem"}
                placeholder="Título da mensagem"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`message-text-${id}`}>Conteúdo da Mensagem</Label>
              <Textarea
                id={`message-text-${id}`}
                defaultValue={data.message || "Conteúdo da mensagem"}
                placeholder="Digite o conteúdo da mensagem aqui"
                rows={5}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const VideoNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`video-title-${id}`);
    const videoTitleInput = document.getElementById(`video-name-${id}`);
    const videoUrlInput = document.getElementById(`video-url-${id}`);
    const descriptionInput = document.getElementById(`video-description-${id}`);

    if (titleInput && videoTitleInput && videoUrlInput && descriptionInput) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Vídeo",
        title: (videoTitleInput as HTMLInputElement).value || "",
        videoUrl: (videoUrlInput as HTMLInputElement).value || "",
        description: (descriptionInput as HTMLTextAreaElement).value || "",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  return (
    <>
      <div
        className={`bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-purple-500 shadow-purple-200"
            : "border-purple-200 dark:border-purple-800"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Video className="h-4 w-4 mr-2 text-purple-500" />
            {data.label || "Vídeo"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.title && <div className="font-medium mb-1">{data.title}</div>}
          {data.videoUrl ? "Vídeo configurado" : "URL do vídeo não definida"}
        </div>

        {data.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {data.description}
          </div>
        )}

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Vídeo</DialogTitle>
            <DialogDescription>
              Configure as propriedades do vídeo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor={`video-title-${id}`}>Título do Nó</Label>
              <Input
                id={`video-title-${id}`}
                defaultValue={data.label || "Vídeo"}
                placeholder="Título do nó de vídeo"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`video-name-${id}`}>Nome do Vídeo</Label>
              <Input
                id={`video-name-${id}`}
                defaultValue={data.title || ""}
                placeholder="Nome do vídeo para o paciente"
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`video-url-${id}`}>URL do Vídeo</Label>
              <Input
                id={`video-url-${id}`}
                defaultValue={data.videoUrl || ""}
                placeholder="https://youtube.com/watch?v=..."
                onChange={(e) => handleInputChange("videoUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`video-description-${id}`}>Descrição</Label>
              <Textarea
                id={`video-description-${id}`}
                defaultValue={data.description || ""}
                placeholder="Descrição do vídeo (opcional)"
                rows={3}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const AudioNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`audio-title-${id}`);
    const audioTitleInput = document.getElementById(`audio-name-${id}`);
    const audioUrlInput = document.getElementById(`audio-url-${id}`);
    const descriptionInput = document.getElementById(`audio-description-${id}`);

    if (titleInput && audioTitleInput && audioUrlInput && descriptionInput) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Áudio",
        title: (audioTitleInput as HTMLInputElement).value || "",
        audioUrl: (audioUrlInput as HTMLInputElement).value || "",
        description: (descriptionInput as HTMLTextAreaElement).value || "",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  return (
    <>
      <div
        className={`bg-orange-50 dark:bg-orange-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-orange-500 shadow-orange-200"
            : "border-orange-200 dark:border-orange-800"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-orange-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Music className="h-4 w-4 mr-2 text-orange-500" />
            {data.label || "Áudio"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-orange-100 dark:hover:bg-orange-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-orange-100 dark:hover:bg-orange-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.title && <div className="font-medium mb-1">{data.title}</div>}
          {data.audioUrl ? "Áudio configurado" : "URL do áudio não definida"}
        </div>

        {data.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {data.description}
          </div>
        )}

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-orange-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Áudio</DialogTitle>
            <DialogDescription>
              Configure as propriedades do áudio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor={`audio-title-${id}`}>Título do Nó</Label>
              <Input
                id={`audio-title-${id}`}
                defaultValue={data.label || "Áudio"}
                placeholder="Título do nó de áudio"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`audio-name-${id}`}>Nome do Áudio</Label>
              <Input
                id={`audio-name-${id}`}
                defaultValue={data.title || ""}
                placeholder="Nome do áudio para o paciente"
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`audio-url-${id}`}>URL do Áudio</Label>
              <Input
                id={`audio-url-${id}`}
                defaultValue={data.audioUrl || ""}
                placeholder="https://exemplo.com/audio.mp3"
                onChange={(e) => handleInputChange("audioUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`audio-description-${id}`}>Descrição</Label>
              <Textarea
                id={`audio-description-${id}`}
                defaultValue={data.description || ""}
                placeholder="Descrição do áudio (opcional)"
                rows={3}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EbookNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`ebook-title-${id}`);
    const ebookTitleInput = document.getElementById(`ebook-name-${id}`);
    const ebookUrlInput = document.getElementById(`ebook-url-${id}`);
    const descriptionInput = document.getElementById(`ebook-description-${id}`);

    if (titleInput && ebookTitleInput && ebookUrlInput && descriptionInput) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "E-book",
        title: (ebookTitleInput as HTMLInputElement).value || "",
        ebookUrl: (ebookUrlInput as HTMLInputElement).value || "",
        description: (descriptionInput as HTMLTextAreaElement).value || "",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  return (
    <>
      <div
        className={`bg-indigo-50 dark:bg-indigo-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-indigo-500 shadow-indigo-200"
            : "border-indigo-200 dark:border-indigo-800"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-indigo-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-indigo-500" />
            {data.label || "E-book"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.title && <div className="font-medium mb-1">{data.title}</div>}
          {data.ebookUrl ? "E-book configurado" : "URL do e-book não definida"}
        </div>

        {data.description && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            {data.description}
          </div>
        )}

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-indigo-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar E-book</DialogTitle>
            <DialogDescription>
              Configure as propriedades do e-book.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor={`ebook-title-${id}`}>Título do Nó</Label>
              <Input
                id={`ebook-title-${id}`}
                defaultValue={data.label || "E-book"}
                placeholder="Título do nó de e-book"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ebook-name-${id}`}>Nome do E-book</Label>
              <Input
                id={`ebook-name-${id}`}
                defaultValue={data.title || ""}
                placeholder="Nome do e-book para o paciente"
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ebook-url-${id}`}>URL do E-book</Label>
              <Input
                id={`ebook-url-${id}`}
                defaultValue={data.ebookUrl || ""}
                placeholder="https://exemplo.com/ebook.pdf"
                onChange={(e) => handleInputChange("ebookUrl", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ebook-description-${id}`}>Descrição</Label>
              <Textarea
                id={`ebook-description-${id}`}
                defaultValue={data.description || ""}
                placeholder="Descrição do e-book (opcional)"
                rows={3}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const EndNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`end-title-${id}`);
    const messageInput = document.getElementById(`end-message-${id}`);
    const showContinueButtonCheckbox = document.getElementById(
      `end-show-continue-${id}`,
    );
    const continueButtonTextInput = document.getElementById(
      `end-continue-text-${id}`,
    );
    const connectToFlowCheckbox = document.getElementById(
      `end-connect-to-flow-${id}`,
    );
    const targetFlowIdInput = document.getElementById(
      `end-target-flow-id-${id}`,
    );

    if (
      titleInput &&
      messageInput &&
      showContinueButtonCheckbox &&
      continueButtonTextInput &&
      connectToFlowCheckbox &&
      targetFlowIdInput
    ) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Fim",
        message: (messageInput as HTMLTextAreaElement).value || "Fim do fluxo",
        showContinueButton:
          (showContinueButtonCheckbox as HTMLInputElement).checked || false,
        continueButtonText:
          (continueButtonTextInput as HTMLInputElement).value ||
          "Continuar Fluxo",
        connectToFlow:
          (connectToFlowCheckbox as HTMLInputElement).checked || false,
        targetFlowId: (targetFlowIdInput as HTMLInputElement).value || "",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  return (
    <>
      <div
        className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-gray-500 shadow-gray-200"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-gray-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <Flag className="h-4 w-4 mr-2 text-gray-500" />
            {data.label || "Fim"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.message || "Fim do fluxo"}
        </div>

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Continue button indicator */}
        {data.showContinueButton && (
          <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-800/30 rounded border border-blue-200 dark:border-blue-700">
            <div className="flex items-center text-xs text-blue-700 dark:text-blue-300">
              <ArrowRight className="h-3 w-3 mr-1" />
              Botão: {data.continueButtonText || "Continuar Fluxo"}
            </div>
          </div>
        )}

        {/* Flow connection indicator */}
        {data.connectToFlow && data.targetFlowId && (
          <div className="mt-3 p-2 bg-purple-100 dark:bg-purple-800/30 rounded border border-purple-200 dark:border-purple-700">
            <div className="flex items-center text-xs text-purple-700 dark:text-purple-300">
              <GitBranch className="h-3 w-3 mr-1" />
              Conectado ao fluxo: {data.targetFlowId}
            </div>
          </div>
        )}

        {/* Output Handle for continuing flow */}
        {(data.showContinueButton || showConnectionPoints) && (
          <Handle
            type="source"
            position={Position.Right}
            className={`w-3 h-3 ${data.showContinueButton ? "bg-blue-500" : "bg-purple-500"} border-2 border-white`}
          />
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Finalização</DialogTitle>
            <DialogDescription>
              Configure a mensagem de finalização do fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`end-title-${id}`}>Título</Label>
              <Input
                id={`end-title-${id}`}
                defaultValue={data.label || "Fim"}
                placeholder="Título da finalização"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end-message-${id}`}>Mensagem Final</Label>
              <Textarea
                id={`end-message-${id}`}
                defaultValue={data.message || "Fim do fluxo"}
                placeholder="Mensagem de finalização para o paciente"
                rows={4}
              />
            </div>

            {/* Continue Flow Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`end-show-continue-${id}`}
                  defaultChecked={data.showContinueButton || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("showContinueButton", checked)
                  }
                />
                <Label
                  htmlFor={`end-show-continue-${id}`}
                  className="flex items-center"
                >
                  <ArrowRight className="h-4 w-4 mr-2 text-blue-500" />
                  Adicionar Botão para Continuar Fluxo
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`end-continue-text-${id}`}>
                  Texto do Botão
                </Label>
                <Input
                  id={`end-continue-text-${id}`}
                  defaultValue={data.continueButtonText || "Continuar Fluxo"}
                  placeholder="Continuar Fluxo"
                  onChange={(e) =>
                    handleInputChange("continueButtonText", e.target.value)
                  }
                />
              </div>

              {/* Connect to another flow */}
              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  id={`end-connect-to-flow-${id}`}
                  defaultChecked={data.connectToFlow || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("connectToFlow", checked)
                  }
                />
                <Label
                  htmlFor={`end-connect-to-flow-${id}`}
                  className="flex items-center"
                >
                  <GitBranch className="h-4 w-4 mr-2 text-purple-500" />
                  Conectar a outro fluxo
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`end-target-flow-id-${id}`}>
                  ID do Fluxo Alvo
                </Label>
                <Input
                  id={`end-target-flow-id-${id}`}
                  defaultValue={data.targetFlowId || ""}
                  placeholder="ID do fluxo para conectar"
                  onChange={(e) =>
                    handleInputChange("targetFlowId", e.target.value)
                  }
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-2">
                  <Flag className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    <p className="font-medium mb-1">
                      Funcionalidade do Nó Fim:
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Marca o final de uma etapa do fluxo</li>
                      <li>• Estabelece um limite para uma etapa concluída</li>
                      <li>
                        • Com o botão habilitado, permite continuar para a
                        próxima etapa
                      </li>
                      <li>
                        • Conecte a saída deste nó a um novo nó "Início" para
                        criar etapas sequenciais
                      </li>
                      <li>
                        • Conecte a outro fluxo para criar fluxos encadeados
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Chart Node for data visualization with enhanced interactivity
const ChartNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [chartData, setChartData] = useState({
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    values: [30, 45, 55, 60, 70, 65],
    trend: "up",
  });

  // Animation effect for chart rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  // Generate random chart data for demo purposes
  useEffect(() => {
    if (data.useRandomData) {
      const generateRandomData = () => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
        const values = Array.from(
          { length: 6 },
          () => Math.floor(Math.random() * 70) + 20,
        );
        const trend = values[values.length - 1] > values[0] ? "up" : "down";

        setChartData({
          labels: months,
          values: values,
          trend: trend,
        });
      };

      generateRandomData();
      const interval = setInterval(generateRandomData, 5000);
      return () => clearInterval(interval);
    }
  }, [data.useRandomData]);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`chart-title-${id}`);
    const descriptionInput = document.getElementById(`chart-description-${id}`);
    const chartTypeSelect = document.getElementById(`chart-type-${id}`);
    const currentPercentageInput = document.getElementById(
      `chart-current-${id}`,
    );
    const idealPercentageInput = document.getElementById(`chart-ideal-${id}`);
    const qualityLevelSelect = document.getElementById(`chart-quality-${id}`);
    const showQualityToggle = document.getElementById(
      `chart-show-quality-${id}`,
    );
    const patientPositionInput = document.getElementById(
      `chart-patient-position-${id}`,
    );
    const showPatientPositionToggle = document.getElementById(
      `chart-show-patient-${id}`,
    );
    const useRandomDataToggle = document.getElementById(
      `chart-use-random-data-${id}`,
    );
    const showTrendIndicatorToggle = document.getElementById(
      `chart-show-trend-${id}`,
    );
    const showComparisonToggle = document.getElementById(
      `chart-show-comparison-${id}`,
    );
    const comparisonValueInput = document.getElementById(
      `chart-comparison-value-${id}`,
    );

    if (
      titleInput &&
      descriptionInput &&
      chartTypeSelect &&
      currentPercentageInput &&
      idealPercentageInput
    ) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Gráfico",
        description:
          (descriptionInput as HTMLTextAreaElement).value ||
          "Visualização de dados",
        chartType: (chartTypeSelect as HTMLSelectElement).value,
        currentPercentage:
          parseInt((currentPercentageInput as HTMLInputElement).value) || 0,
        idealPercentage:
          parseInt((idealPercentageInput as HTMLInputElement).value) || 100,
        qualityLevel:
          (qualityLevelSelect as HTMLSelectElement)?.value || "good",
        showQualityInteraction:
          (showQualityToggle as HTMLInputElement)?.checked || false,
        patientPosition:
          parseInt((patientPositionInput as HTMLInputElement)?.value) || 50,
        showPatientPosition:
          (showPatientPositionToggle as HTMLInputElement)?.checked || false,
        useRandomData:
          (useRandomDataToggle as HTMLInputElement)?.checked || false,
        showTrendIndicator:
          (showTrendIndicatorToggle as HTMLInputElement)?.checked || false,
        showComparison:
          (showComparisonToggle as HTMLInputElement)?.checked || false,
        comparisonValue:
          parseInt((comparisonValueInput as HTMLInputElement)?.value) || 0,
      });
    }
    setShowEditModal(false);
  };

  const renderChartPreview = () => {
    const currentPerc = data.currentPercentage || 65;
    const idealPerc = data.idealPercentage || 85;
    const patientPos = data.patientPosition || 50;
    const comparisonValue = data.comparisonValue || 40;
    const animatedCurrentPerc = currentPerc * animationProgress;
    const animatedIdealPerc = idealPerc * animationProgress;
    const animatedPatientPos = patientPos * animationProgress;
    const animatedComparisonValue = comparisonValue * animationProgress;

    const getQualityColor = () => {
      switch (data.qualityLevel) {
        case "excellent":
          return "#10b981";
        case "good":
          return "#3b82f6";
        case "fair":
          return "#f59e0b";
        case "poor":
          return "#ef4444";
        default:
          return "#3b82f6";
      }
    };

    const renderTrendIndicator = () => {
      if (!data.showTrendIndicator) return null;

      const trend =
        chartData.trend || (currentPerc > comparisonValue ? "up" : "down");
      const trendColor = trend === "up" ? "#10b981" : "#ef4444";
      const TrendIcon = trend === "up" ? TrendingUp : ArrowDown;

      return (
        <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm transform -translate-y-1/2 translate-x-1/2">
          <div
            className={`rounded-full p-1 ${trend === "up" ? "bg-green-100" : "bg-red-100"}`}
            style={{ boxShadow: isHovered ? `0 0 8px ${trendColor}` : "none" }}
          >
            <TrendIcon
              className={`h-3 w-3 ${trend === "up" ? "text-green-500" : "text-red-500"}`}
              style={{
                filter: isHovered
                  ? `drop-shadow(0 0 3px ${trendColor})`
                  : "none",
              }}
            />
          </div>
        </div>
      );
    };

    switch (data.chartType || "progress") {
      case "progress":
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Atual: {currentPerc}%</span>
              <span>Ideal: {idealPerc}%</span>
              {data.showPatientPosition && <span>Paciente: {patientPos}%</span>}
              {data.showComparison && <span>Anterior: {comparisonValue}%</span>}
            </div>
            <div className="relative">
              {/* Comparison background if enabled */}
              {data.showComparison && (
                <div
                  className="absolute top-0 h-4 bg-gray-300 dark:bg-gray-600 opacity-30 rounded-full transition-all duration-700"
                  style={{
                    width: `${animatedComparisonValue}%`,
                    zIndex: 1,
                  }}
                />
              )}

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                {/* Current progress with gradient */}
                <div
                  className="h-4 rounded-full transition-all duration-1000 ease-out relative z-10"
                  style={{
                    width: `${animatedCurrentPerc}%`,
                    background: `linear-gradient(90deg, ${getQualityColor()}, ${getQualityColor()}aa)`,
                    boxShadow: isHovered
                      ? `0 0 10px ${getQualityColor()}66`
                      : "none",
                  }}
                >
                  {/* Animated pulse effect at the end of progress bar */}
                  <div
                    className="absolute right-0 top-0 h-full w-2 rounded-full animate-pulse"
                    style={{
                      background: `radial-gradient(circle, ${getQualityColor()}, transparent)`,
                      opacity: isHovered ? 0.8 : 0.4,
                    }}
                  />
                </div>

                {/* Ideal marker */}
                <div
                  className="absolute top-0 w-1 h-4 bg-green-500 rounded-full transition-all duration-500 z-20"
                  style={{
                    left: `${animatedIdealPerc}%`,
                    transform: "translateX(-50%)",
                    boxShadow: isHovered ? "0 0 8px #10b981" : "none",
                  }}
                />

                {/* Patient position marker */}
                {data.showPatientPosition && (
                  <div
                    className="absolute top-0 w-2 h-4 bg-purple-500 rounded-full transition-all duration-700 flex items-center justify-center z-20"
                    style={{
                      left: `${animatedPatientPos}%`,
                      transform: "translateX(-50%)",
                      boxShadow: isHovered ? "0 0 8px #8b5cf6" : "none",
                    }}
                  >
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  </div>
                )}
              </div>

              {renderTrendIndicator()}
            </div>

            {/* Interactive quality indicator */}
            {data.showQualityInteraction && (
              <div className="text-center">
                <div
                  className={`inline-flex items-center space-x-2 rounded-full px-3 py-1 transition-all duration-300 ${
                    isHovered ? "bg-opacity-80 scale-105" : "bg-opacity-60"
                  }`}
                  style={{ backgroundColor: `${getQualityColor()}20` }}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isHovered ? "animate-pulse" : ""
                    }`}
                    style={{ backgroundColor: getQualityColor() }}
                  />
                  <span className="text-xs font-medium">
                    {data.qualityLevel === "excellent"
                      ? "🌟 Excelente"
                      : data.qualityLevel === "good"
                        ? "✅ Bom"
                        : data.qualityLevel === "fair"
                          ? "⚠️ Regular"
                          : "🔴 Precisa Melhorar"}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case "circular":
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = `${(animatedCurrentPerc / 100) * circumference} ${circumference}`;
        const idealStrokeDasharray = `${(animatedIdealPerc / 100) * circumference} ${circumference}`;
        const patientStrokeDasharray = `${(animatedPatientPos / 100) * circumference} ${circumference}`;
        const comparisonStrokeDasharray = `${(animatedComparisonValue / 100) * circumference} ${circumference}`;

        return (
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="6"
                  fill="transparent"
                />

                {/* Comparison circle if enabled */}
                {data.showComparison && (
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#94a3b8"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={comparisonStrokeDasharray}
                    strokeLinecap="round"
                    opacity="0.3"
                    className="transition-all duration-1000"
                  />
                )}

                {/* Ideal progress (background) */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={idealStrokeDasharray}
                  strokeLinecap="round"
                  opacity="0.4"
                  className="transition-all duration-1000"
                />

                {/* Patient position */}
                {data.showPatientPosition && (
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#8b5cf6"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={patientStrokeDasharray}
                    strokeLinecap="round"
                    opacity="0.7"
                    className="transition-all duration-700"
                    style={{
                      filter: isHovered
                        ? "drop-shadow(0 0 6px #8b5cf6)"
                        : "none",
                    }}
                  />
                )}

                {/* Current progress */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={getQualityColor()}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 8px ${getQualityColor()})`
                      : "none",
                  }}
                />

                {/* Animated dot at the end of progress */}
                <circle
                  cx={
                    40 +
                    radius *
                      Math.cos(
                        (animatedCurrentPerc / 100) * 2 * Math.PI - Math.PI / 2,
                      )
                  }
                  cy={
                    40 +
                    radius *
                      Math.sin(
                        (animatedCurrentPerc / 100) * 2 * Math.PI - Math.PI / 2,
                      )
                  }
                  r="3"
                  fill={getQualityColor()}
                  className={isHovered ? "animate-pulse" : ""}
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 3px ${getQualityColor()})`
                      : "none",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-sm font-bold transition-all duration-300 ${
                    isHovered ? "scale-110" : ""
                  }`}
                >
                  {currentPerc}%
                </span>
              </div>

              {data.showTrendIndicator && (
                <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                  <div
                    className={`rounded-full p-1 ${currentPerc > (data.showComparison ? comparisonValue : 50) ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {currentPerc >
                    (data.showComparison ? comparisonValue : 50) ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-center space-y-1">
              <div className="text-gray-600 dark:text-gray-400">
                Meta: {idealPerc}%
              </div>
              {data.showPatientPosition && (
                <div className="text-purple-600 dark:text-purple-400">
                  👤 Paciente: {patientPos}%
                </div>
              )}
              {data.showComparison && (
                <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Anterior: {comparisonValue}%
                  <span className="ml-1">
                    {currentPerc > comparisonValue ? (
                      <span className="text-green-500">
                        ↑{currentPerc - comparisonValue}%
                      </span>
                    ) : currentPerc < comparisonValue ? (
                      <span className="text-red-500">
                        ↓{comparisonValue - currentPerc}%
                      </span>
                    ) : (
                      <span className="text-gray-500">=</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case "bar":
        return (
          <div className="flex items-end justify-center space-x-3 h-16">
            {/* Comparison bar if enabled */}
            {data.showComparison && (
              <div className="flex flex-col items-center">
                <div
                  className="bg-gray-400 dark:bg-gray-600 rounded-t w-6 transition-all duration-700 opacity-40"
                  style={{
                    height: `${(animatedComparisonValue / 100) * 60}px`,
                  }}
                />
                <span className="text-xs mt-1">Anterior</span>
              </div>
            )}

            {/* Current value bar */}
            <div className="flex flex-col items-center">
              <div
                className="rounded-t w-6 transition-all duration-1000 ease-out relative"
                style={{
                  height: `${(animatedCurrentPerc / 100) * 60}px`,
                  background: `linear-gradient(to top, ${getQualityColor()}, ${getQualityColor()}aa)`,
                  boxShadow: isHovered
                    ? `0 0 10px ${getQualityColor()}66`
                    : "none",
                }}
              >
                {/* Animated pulse at top of bar */}
                <div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full animate-pulse"
                  style={{
                    background: getQualityColor(),
                    opacity: isHovered ? 0.8 : 0.4,
                  }}
                />

                {data.showTrendIndicator &&
                  currentPerc >
                    (data.showComparison ? comparisonValue : 50) && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    </div>
                  )}

                {data.showTrendIndicator &&
                  currentPerc <
                    (data.showComparison ? comparisonValue : 50) && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    </div>
                  )}
              </div>
              <span className="text-xs mt-1">Atual</span>
            </div>

            {/* Ideal bar */}
            <div className="flex flex-col items-center">
              <div
                className="bg-green-500 rounded-t w-6 transition-all duration-700"
                style={{
                  height: `${(animatedIdealPerc / 100) * 60}px`,
                  boxShadow: isHovered ? "0 0 8px #10b981" : "none",
                }}
              />
              <span className="text-xs mt-1">Ideal</span>
            </div>

            {/* Patient position bar */}
            {data.showPatientPosition && (
              <div className="flex flex-col items-center">
                <div
                  className="bg-purple-500 rounded-t w-6 transition-all duration-500 relative"
                  style={{
                    height: `${(animatedPatientPos / 100) * 60}px`,
                    boxShadow: isHovered ? "0 0 8px #8b5cf6" : "none",
                  }}
                >
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                </div>
                <span className="text-xs mt-1">👤</span>
              </div>
            )}
          </div>
        );

      case "line":
        // Line chart implementation
        const maxValue = Math.max(...chartData.values, 100);
        const chartHeight = 60;
        const chartWidth = 180;

        // Calculate points for the line
        const points = chartData.values
          .map((value, index) => {
            const x = (index / (chartData.values.length - 1)) * chartWidth;
            const y = chartHeight - (value / maxValue) * chartHeight;
            return `${x},${y}`;
          })
          .join(" ");

        return (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-16">
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                <line
                  x1="0"
                  y1={chartHeight}
                  x2={chartWidth}
                  y2={chartHeight}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <line
                  x1="0"
                  y1={chartHeight / 2}
                  x2={chartWidth}
                  y2={chartHeight / 2}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />

                {/* Line chart */}
                <polyline
                  points={points}
                  fill="none"
                  stroke={getQualityColor()}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 3px ${getQualityColor()})`
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                />

                {/* Dots at data points */}
                {chartData.values.map((value, index) => {
                  const x =
                    (index / (chartData.values.length - 1)) * chartWidth;
                  const y = chartHeight - (value / maxValue) * chartHeight;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="2"
                      fill={getQualityColor()}
                      className={
                        index === chartData.values.length - 1
                          ? "animate-pulse"
                          : ""
                      }
                      style={{
                        filter: isHovered
                          ? `drop-shadow(0 0 2px ${getQualityColor()})`
                          : "none",
                      }}
                    />
                  );
                })}

                {/* Current percentage marker */}
                <line
                  x1="0"
                  y1={chartHeight - (currentPerc / maxValue) * chartHeight}
                  x2={chartWidth}
                  y2={chartHeight - (currentPerc / maxValue) * chartHeight}
                  stroke={getQualityColor()}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />

                {/* Ideal percentage marker */}
                <line
                  x1="0"
                  y1={chartHeight - (idealPerc / maxValue) * chartHeight}
                  x2={chartWidth}
                  y2={chartHeight - (idealPerc / maxValue) * chartHeight}
                  stroke="#10b981"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
              </svg>

              {data.showTrendIndicator && (
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm transform -translate-y-1/2 translate-x-1/2">
                  <div
                    className={`rounded-full p-1 ${chartData.trend === "up" ? "bg-green-100" : "bg-red-100"}`}
                  >
                    {chartData.trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between w-full px-1 mt-1">
              {chartData.labels.map((label, index) => (
                <span key={index} className="text-xs text-gray-500">
                  {label}
                </span>
              ))}
            </div>

            {/* Legend */}
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: getQualityColor() }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Atual: {currentPerc}%
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full mr-1 bg-green-500"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Meta: {idealPerc}%
                </span>
              </div>
            </div>
          </div>
        );

      case "radar":
        // Radar chart implementation
        const categories = [
          "Físico",
          "Mental",
          "Social",
          "Emocional",
          "Espiritual",
        ];
        const values = data.useRandomData
          ? [65, 80, 55, 70, 60]
          : [
              currentPerc,
              idealPerc,
              patientPos,
              comparisonValue,
              (currentPerc + idealPerc) / 2,
            ];

        const centerX = 50;
        const centerY = 50;
        const radarRadius = 40;

        // Calculate points for the radar chart
        const radarPoints = values
          .map((value, index) => {
            const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
            const x = centerX + ((radarRadius * value) / 100) * Math.cos(angle);
            const y = centerY + ((radarRadius * value) / 100) * Math.sin(angle);
            return `${x},${y}`;
          })
          .join(" ");

        // Calculate points for the background grid
        const createGridPoints = (percentage) => {
          return categories
            .map((_, index) => {
              const angle =
                (Math.PI * 2 * index) / categories.length - Math.PI / 2;
              const x =
                centerX + ((radarRadius * percentage) / 100) * Math.cos(angle);
              const y =
                centerY + ((radarRadius * percentage) / 100) * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(" ");
        };

        return (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-32">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background grid */}
                {[25, 50, 75, 100].map((percentage) => (
                  <polygon
                    key={percentage}
                    points={createGridPoints(percentage)}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    opacity={0.5}
                  />
                ))}

                {/* Axes */}
                {categories.map((_, index) => {
                  const angle =
                    (Math.PI * 2 * index) / categories.length - Math.PI / 2;
                  const x = centerX + radarRadius * Math.cos(angle);
                  const y = centerY + radarRadius * Math.sin(angle);
                  return (
                    <line
                      key={index}
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* Data polygon */}
                <polygon
                  points={radarPoints}
                  fill={`${getQualityColor()}33`}
                  stroke={getQualityColor()}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 3px ${getQualityColor()})`
                      : "none",
                    transition: "all 0.3s ease",
                  }}
                />

                {/* Data points */}
                {values.map((value, index) => {
                  const angle =
                    (Math.PI * 2 * index) / values.length - Math.PI / 2;
                  const x =
                    centerX + ((radarRadius * value) / 100) * Math.cos(angle);
                  const y =
                    centerY + ((radarRadius * value) / 100) * Math.sin(angle);
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="2"
                      fill={getQualityColor()}
                      style={{
                        filter: isHovered
                          ? `drop-shadow(0 0 2px ${getQualityColor()})`
                          : "none",
                      }}
                    />
                  );
                })}

                {/* Category labels */}
                {categories.map((category, index) => {
                  const angle =
                    (Math.PI * 2 * index) / categories.length - Math.PI / 2;
                  const x = centerX + (radarRadius + 10) * Math.cos(angle);
                  const y = centerY + (radarRadius + 10) * Math.sin(angle);
                  return (
                    <text
                      key={index}
                      x={x}
                      y={y}
                      fontSize="4"
                      fill="currentColor"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {category}
                    </text>
                  );
                })}
              </svg>

              {data.showTrendIndicator && (
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                  <div className="rounded-full p-1 bg-green-100">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex justify-center mt-1">
              <div className="flex items-center">
                <div
                  className="w-3 h-3 mr-1 rounded-sm"
                  style={{
                    backgroundColor: `${getQualityColor()}33`,
                    borderColor: getQualityColor(),
                    borderWidth: "1px",
                  }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Desempenho
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-16 w-full flex items-center justify-center text-gray-400">
            <div className="animate-pulse">
              <BarChart3 className="h-8 w-8" />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        className={`bg-sky-50 dark:bg-sky-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[300px] transition-all duration-300 ${
          selected
            ? "border-sky-500 shadow-sky-200 shadow-lg scale-105"
            : "border-sky-200 dark:border-sky-800"
        } ${isHovered ? "shadow-xl transform scale-102" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-sky-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2 text-sky-500" />
            {data.label || "Gráfico"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-sky-100 dark:hover:bg-sky-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-sky-100 dark:hover:bg-sky-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.description || "Visualização de progresso do paciente"}
        </div>

        <div
          className={`bg-white dark:bg-gray-800 rounded border p-3 mb-3 transition-all duration-300 ${
            isHovered ? "shadow-md border-sky-300" : ""
          }`}
        >
          {renderChartPreview()}
        </div>

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-sky-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Gráfico de Progresso</DialogTitle>
            <DialogDescription>
              Configure as propriedades e visualização do gráfico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor={`chart-title-${id}`}>Título</Label>
              <Input
                id={`chart-title-${id}`}
                defaultValue={data.label || "Gráfico"}
                placeholder="Título do gráfico"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`chart-description-${id}`}>Descrição</Label>
              <Textarea
                id={`chart-description-${id}`}
                defaultValue={
                  data.description || "Visualização de progresso do paciente"
                }
                placeholder="Descrição do gráfico"
                rows={2}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`chart-type-${id}`}>Tipo de Visualização</Label>
              <Select
                defaultValue={data.chartType || "progress"}
                onValueChange={(value) => handleInputChange("chartType", value)}
              >
                <SelectTrigger id={`chart-type-${id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Barra de Progresso</SelectItem>
                  <SelectItem value="circular">Gráfico Circular</SelectItem>
                  <SelectItem value="bar">Gráfico de Barras</SelectItem>
                  <SelectItem value="line">Gráfico de Linha</SelectItem>
                  <SelectItem value="radar">Gráfico Radar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`chart-current-${id}`}>
                  Porcentagem Atual (%)
                </Label>
                <Input
                  id={`chart-current-${id}`}
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={data.currentPercentage || 65}
                  placeholder="65"
                  onChange={(e) =>
                    handleInputChange(
                      "currentPercentage",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`chart-ideal-${id}`}>
                  Porcentagem Ideal (%)
                </Label>
                <Input
                  id={`chart-ideal-${id}`}
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={data.idealPercentage || 85}
                  placeholder="85"
                  onChange={(e) =>
                    handleInputChange(
                      "idealPercentage",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`chart-show-quality-${id}`}
                  defaultChecked={data.showQualityInteraction || false}
                />
                <Label htmlFor={`chart-show-quality-${id}`}>
                  Mostrar Indicador de Qualidade
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`chart-quality-${id}`}>Grau de Qualidade</Label>
                <Select
                  defaultValue={data.qualityLevel || "good"}
                  onValueChange={(value) =>
                    handleInputChange("qualityLevel", value)
                  }
                >
                  <SelectTrigger id={`chart-quality-${id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">🌟 Excelente</SelectItem>
                    <SelectItem value="good">✅ Bom</SelectItem>
                    <SelectItem value="fair">⚠️ Regular</SelectItem>
                    <SelectItem value="poor">🔴 Precisa Melhorar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`chart-show-patient-${id}`}
                  defaultChecked={data.showPatientPosition || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("showPatientPosition", checked)
                  }
                />
                <Label htmlFor={`chart-show-patient-${id}`}>
                  Mostrar Posição do Paciente
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`chart-patient-position-${id}`}>
                  Posição do Paciente (%)
                </Label>
                <Input
                  id={`chart-patient-position-${id}`}
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={data.patientPosition || 50}
                  placeholder="50"
                  onChange={(e) =>
                    handleInputChange(
                      "patientPosition",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`chart-show-trend-${id}`}
                  defaultChecked={data.showTrendIndicator || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("showTrendIndicator", checked)
                  }
                />
                <Label htmlFor={`chart-show-trend-${id}`}>
                  Mostrar Indicador de Tendência
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`chart-show-comparison-${id}`}
                  defaultChecked={data.showComparison || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("showComparison", checked)
                  }
                />
                <Label htmlFor={`chart-show-comparison-${id}`}>
                  Mostrar Comparação com Valor Anterior
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`chart-comparison-value-${id}`}>
                  Valor Anterior para Comparação (%)
                </Label>
                <Input
                  id={`chart-comparison-value-${id}`}
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={data.comparisonValue || 40}
                  placeholder="40"
                  onChange={(e) =>
                    handleInputChange(
                      "comparisonValue",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`chart-use-random-data-${id}`}
                  defaultChecked={data.useRandomData || false}
                  onCheckedChange={(checked) =>
                    handleInputChange("useRandomData", checked)
                  }
                />
                <Label htmlFor={`chart-use-random-data-${id}`}>
                  Usar Dados Aleatórios (Apenas para Demonstração)
                </Label>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Monitor className="h-4 w-4 mr-2" />
                Preview Interativo:
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                O paciente verá o progresso atual comparado com a meta ideal.
                {data.showQualityInteraction &&
                  " Incluindo indicadores visuais de qualidade."}
                {data.showPatientPosition &&
                  " Com marcador da posição atual do paciente."}
                {data.showComparison && " Com comparação ao valor anterior."}
                {data.showTrendIndicator && " Com indicador de tendência."}
              </div>
              <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-inner border">
                {renderChartPreview()}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Activity className="h-3 w-3 mr-1" />
                Gráfico com animações e efeitos interativos
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// WhatsApp Notification Node Component
const WhatsAppNotificationNode = ({ data, id, selected }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);

  const updateNodeData = (newData) => {
    if (window.updateNodeData) {
      window.updateNodeData(id, newData);
    }
  };

  const saveChanges = () => {
    const titleInput = document.getElementById(`whatsapp-title-${id}`);
    const messageInput = document.getElementById(`whatsapp-message-${id}`);
    const phoneFieldInput = document.getElementById(
      `whatsapp-phone-field-${id}`,
    );
    const testPhoneInput = document.getElementById(`whatsapp-test-phone-${id}`);

    if (titleInput && messageInput && phoneFieldInput) {
      updateNodeData({
        label: (titleInput as HTMLInputElement).value || "Notificação WhatsApp",
        message:
          (messageInput as HTMLTextAreaElement).value ||
          "Olá! Esta é uma mensagem do seu especialista.",
        phoneField: (phoneFieldInput as HTMLInputElement).value || "phone",
        testPhone: (testPhoneInput as HTMLInputElement).value || "",
      });
    }
    setShowEditModal(false);
  };

  const toggleConnectionPoints = () => {
    setShowConnectionPoints(!showConnectionPoints);
  };

  // Auto-save on input change
  const handleInputChange = (field, value) => {
    updateNodeData({
      ...data,
      [field]: value,
    });
  };

  return (
    <>
      <div
        className={`bg-green-50 dark:bg-green-900/30 rounded-lg shadow-lg p-4 border-2 min-w-[250px] ${
          selected
            ? "border-green-500 shadow-green-200"
            : "border-green-200 dark:border-green-800"
        }`}
      >
        {/* Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-green-500 border-2 border-white"
        />

        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-green-500" />
            {data.label || "Notificação WhatsApp"}
          </h3>
          <div className="flex space-x-1">
            <button
              className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.duplicateNode) window.duplicateNode(id);
              }}
              title="Duplicar"
            >
              <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              onClick={(e) => {
                e.stopPropagation();
                if (window.deleteNode) window.deleteNode(id);
              }}
              title="Excluir"
            >
              <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
          {data.message || "Olá! Esta é uma mensagem do seu especialista."}
        </div>

        <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-green-200 dark:border-green-800 mb-3">
          <div className="flex items-center text-xs text-green-700 dark:text-green-300">
            <MessageSquare className="h-3 w-3 mr-1" />
            Mensagem será enviada via WhatsApp
          </div>
          {data.phoneField && (
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <User className="h-3 w-3 mr-1" />
              Campo de telefone: {data.phoneField}
            </div>
          )}
        </div>

        {/* Connection button */}
        <div className="mt-3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleConnectionPoints}
            className="flex items-center text-xs"
          >
            {showConnectionPoints ? (
              <Unlink className="h-3 w-3 mr-1" />
            ) : (
              <Link className="h-3 w-3 mr-1" />
            )}
            {showConnectionPoints ? "Ocultar conexões" : "Mostrar conexões"}
          </Button>
        </div>

        {/* Input Handle for connections */}
        {showConnectionPoints && (
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-purple-500 border-2 border-white"
          />
        )}

        {/* Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-green-500 border-2 border-white"
        />
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Notificação WhatsApp</DialogTitle>
            <DialogDescription>
              Configure a mensagem que será enviada via WhatsApp para o
              paciente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={`whatsapp-title-${id}`}>Título</Label>
              <Input
                id={`whatsapp-title-${id}`}
                defaultValue={data.label || "Notificação WhatsApp"}
                placeholder="Título da notificação"
                onChange={(e) => handleInputChange("label", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`whatsapp-message-${id}`}>
                Mensagem WhatsApp
              </Label>
              <Textarea
                id={`whatsapp-message-${id}`}
                defaultValue={
                  data.message ||
                  "Olá! Esta é uma mensagem do seu especialista."
                }
                placeholder="Digite a mensagem que será enviada via WhatsApp"
                rows={5}
                onChange={(e) => handleInputChange("message", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`whatsapp-media-${id}`}>Anexar Mídia (imagem, vídeo ou PDF)</Label>
              <Input
                id={`whatsapp-media-${id}`}
                type="file"
                multiple
                accept="image/*,video/*,application/pdf"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  if (window.uploadMediaToSupabase) {
                    const urls = await window.uploadMediaToSupabase(files);
                    handleInputChange("mediaUrls", urls);
                  }
                }}
              />
              {Array.isArray(data.mediaUrls) && data.mediaUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  {data.mediaUrls.map((url, idx) => (
                    <div key={idx} className="text-xs text-green-700 dark:text-green-300 underline break-all">
                      <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Você pode anexar imagens, vídeos ou PDFs. Os arquivos serão enviados ao salvar.
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  <p className="font-medium mb-1">Informações importantes:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• O número de telefone do paciente será buscado automaticamente do cadastro.</li>
                    <li>• A mensagem será enviada via WhatsApp usando a Edge Function do Supabase.</li>
                    <li>• O envio só ocorre quando o paciente atinge este nó durante a execução do fluxo.</li>
                    <li>• Certifique-se de que o paciente tem um número de WhatsApp válido cadastrado.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveChanges}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Node types configuration
const nodeTypes = {
  startNode: StartNode,
  questionNode: QuestionNode,
  messageNode: MessageNode,
  videoNode: VideoNode,
  audioNode: AudioNode,
  ebookNode: EbookNode,
  endNode: EndNode,
  chartNode: ChartNode,
  whatsAppNode: WhatsAppNotificationNode,
};

// Main FlowBuilder Component
export const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [flowName, setFlowName] = useState("Novo Fluxo");
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [nodePosition, setNodePosition] = useState({ x: 0, y: 0 });
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [showSavedFlowsDialog, setShowSavedFlowsDialog] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewCurrentStep, setPreviewCurrentStep] = useState(0);

  // Make functions available globally for node components
  useEffect(() => {
    window.updateNodeData = (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        }),
      );

      if (nodeId === selectedNode?.id) {
        setSelectedNode(null);
      }
    };

    window.duplicateNode = (nodeId) => {
      const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
      if (nodeToDuplicate) {
        // Prevent duplication of start and end nodes
        if (nodeToDuplicate.type === "startNode") {
          alert(
            "Não é possível duplicar o nó de início. Deve haver apenas um nó de início no fluxo.",
          );
          return;
        }
        if (nodeToDuplicate.type === "endNode") {
          alert(
            "Não é possível duplicar o nó de fim. Crie um novo nó de fim se necessário.",
          );
          return;
        }

        // Create a deep copy of the node data to ensure independence
        const newNodeData = JSON.parse(JSON.stringify(nodeToDuplicate.data));
        newNodeData.label = `${newNodeData.label} (Cópia)`;

        // Generate unique ID with timestamp and random component
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const newId = `${nodeToDuplicate.type.replace("Node", "")}-${timestamp}-${random}`;

        const newNode = {
          id: newId,
          type: nodeToDuplicate.type,
          position: {
            x: nodeToDuplicate.position.x + 100,
            y: nodeToDuplicate.position.y + 100,
          },
          data: newNodeData,
          selected: false,
          dragging: false,
        };

        setNodes((nds) => [...nds, newNode]);

        // Clear any selection to prevent issues
        setSelectedNode(null);

        // Show success message
        setTimeout(() => {
          alert(`Nó "${newNodeData.label}" duplicado com sucesso!`);
        }, 100);
      }
    };

    window.deleteNode = (nodeId) => {
      if (confirm("Tem certeza que deseja excluir este nó?")) {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) =>
          eds.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId,
          ),
        );
        setSelectedNode(null);
      }
    };
  }, [nodes, setNodes, setEdges]);

  // Function to execute WhatsApp notification during flow execution
  const executeWhatsAppNotification = async (nodeData, patientData) => {
    try {
      // Get the phone number from patient data or use test phone if available
      const phoneField = nodeData.phoneField || "phone";
      const phoneNumber =
        nodeData.testPhone || (patientData && patientData[phoneField]);

      if (!phoneNumber) {
        console.error("No phone number available for WhatsApp notification");
        return false;
      }

      // Call the Supabase Edge Function to send the WhatsApp message
      const { data, error } = await supabase.functions.invoke(
        "send-whatsapp-notification",
        {
          body: {
            to: phoneNumber,
            message:
              nodeData.message ||
              "Olá! Esta é uma mensagem do seu especialista.",
          },
        },
      );

      if (error) {
        console.error("Error sending WhatsApp notification:", error);
        return false;
      }

      console.log("WhatsApp notification sent successfully:", data);
      return true;
    } catch (error) {
      console.error("Exception sending WhatsApp notification:", error);
      return false;
    }
  };

  // Handle connections between nodes
  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      // Prevent self-connections
      if (params.source === params.target) {
        alert("Não é possível conectar um nó a ele mesmo.");
        return;
      }

      // Check if source node is a text-input-only question and already has a connection
      if (
        sourceNode &&
        sourceNode.type === "questionNode" &&
        sourceNode.data.textInputOnly
      ) {
        const existingConnections = edges.filter(
          (edge) => edge.source === params.source,
        );
        if (existingConnections.length >= 1) {
          alert("Perguntas de resposta digitada só podem ter uma conexão.");
          return;
        }
      }

      // Check for flow connections (end node to start node)
      if (
        sourceNode &&
        targetNode &&
        sourceNode.type === "endNode" &&
        targetNode.type === "startNode"
      ) {
        // Update the end node with connection information
        if (window.updateNodeData) {
          window.updateNodeData(sourceNode.id, {
            ...sourceNode.data,
            connectToFlow: true,
            targetFlowId: targetNode.id.split("-")[1], // Extract flow ID from node ID
          });

          // Update the start node with connection information
          window.updateNodeData(targetNode.id, {
            ...targetNode.data,
            isLinkedFlow: true,
            sourceFlowId: sourceNode.id.split("-")[1], // Extract flow ID from node ID
          });
        }
      }

      // Check for duplicate connections
      const existingConnection = edges.find(
        (edge) =>
          edge.source === params.source &&
          edge.target === params.target &&
          edge.sourceHandle === params.sourceHandle &&
          edge.targetHandle === params.targetHandle,
      );
      if (existingConnection) {
        alert("Esta conexão já existe.");
        return;
      }

      let edgeColor = "#3b82f6";
      let edgeStyle = { strokeWidth: 3 };
      let edgeLabel = "";

      // Color edges and add labels based on source node type
      if (sourceNode) {
        switch (sourceNode.type) {
          case "startNode":
            edgeColor = "#10b981"; // Emerald
            edgeLabel = "Início";
            break;
          case "questionNode":
            edgeColor = "#3b82f6"; // Blue
            if (sourceNode.data.textInputOnly) {
              edgeLabel = "Resposta";
            } else if (
              params.sourceHandle &&
              params.sourceHandle.startsWith("option-")
            ) {
              const optionIndex = parseInt(
                params.sourceHandle.replace("option-", ""),
              );
              const option = sourceNode.data.options?.[optionIndex];
              edgeLabel = option
                ? option.substring(0, 15) + (option.length > 15 ? "..." : "")
                : "Opção";
            } else {
              edgeLabel = "Resposta";
            }
            break;
          case "messageNode":
            edgeColor = "#10b981"; // Green
            edgeLabel = "Continuar";
            break;
          case "videoNode":
            edgeColor = "#8b5cf6"; // Purple
            edgeLabel = "Após vídeo";
            break;
          case "audioNode":
            edgeColor = "#f59e0b"; // Orange
            edgeLabel = "Após áudio";
            break;
          case "ebookNode":
            edgeColor = "#6366f1"; // Indigo
            edgeLabel = "Após e-book";
            break;
          case "chartNode":
            edgeColor = "#0ea5e9"; // Sky
            edgeLabel = "Após gráfico";
            break;
          case "whatsAppNode":
            edgeColor = "#10b981"; // Green
            edgeLabel = "Após envio";
            break;
          default:
            edgeColor = "#6b7280"; // Gray
            edgeLabel = "Próximo";
        }
      }

      const newEdge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        animated: true,
        style: {
          stroke: edgeColor,
          strokeWidth: 3,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          ...edgeStyle,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
          width: 20,
          height: 20,
        },
        label: edgeLabel,
        labelStyle: {
          fill: edgeColor,
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: "white",
          fillOpacity: 0.9,
        },
        data: {
          label: edgeLabel,
          sourceNodeType: sourceNode?.type,
          targetNodeType: targetNode?.type,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes, edges],
  );

  // Handle pane click to add a node
  const onPaneClick = useCallback(
    (event) => {
      if (event.target.classList.contains("react-flow__pane")) {
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        setNodePosition(position);
        setShowAddNodeDialog(true);
      }
    },
    [reactFlowInstance],
  );

  // Handle node selection
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNode(node);

    // For testing WhatsApp node in design mode
    if (node.type === "whatsAppNode" && event.altKey) {
      const mockPatientData = {
        phone: prompt(
          "Enter a phone number for testing (E.164 format, e.g. +5511999999999):",
          "+5511999999999",
        ),
      };

      if (mockPatientData.phone) {
        executeWhatsAppNotification(node.data, mockPatientData).then(
          (success) => {
            if (success) {
              alert("WhatsApp test message sent successfully!");
            } else {
              alert(
                "Failed to send WhatsApp test message. Check console for details.",
              );
            }
          },
        );
      }
    }
  }, []);

  // Handle node drag end to prevent stuck nodes
  const onNodeDragStop = useCallback(
    (event, node) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              position: node.position,
              dragging: false,
            };
          }
          return n;
        }),
      );
    },
    [setNodes],
  );

  // Add a new node
  const addNode = (type) => {
    // Check if trying to add multiple start nodes
    if (type === "start") {
      const existingStartNodes = nodes.filter(
        (node) => node.type === "startNode",
      );
      if (existingStartNodes.length > 0) {
        alert(
          "Já existe um nó de início no fluxo. Deve haver apenas um nó de início.",
        );
        setShowAddNodeDialog(false);
        return;
      }
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newNode = {
      id: `${type}-${timestamp}-${random}`,
      type: `${type}Node`,
      position: nodePosition,
      data: {},
      selected: false,
      dragging: false,
    };

    // Set default data based on node type
    switch (type) {
      case "start":
        newNode.data = {
          label: "Início",
          subtitle: "Bem-vindo ao questionário",
          message: "Início do fluxo",
          mediaType: "none",
          mediaUrl: "",
          enableTimer: false,
          timerAmount: 1,
          timerUnit: "hours",
          showContinueButton: false,
          isLinkedFlow: false,
          sourceFlowId: "",
        };
        break;
      case "question":
        newNode.data = {
          label: "Nova Pergunta",
          question: "Qual é a sua pergunta?",
          options: ["Opção 1", "Opção 2"],
          questionType: "single",
          useEmojis: false,
          useImages: false,
          allowTextInput: false,
          textInputOnly: false,
        };
        break;
      case "message":
        newNode.data = {
          label: "Nova Mensagem",
          message: "Conteúdo da mensagem",
        };
        break;
      case "video":
        newNode.data = {
          label: "Novo Vídeo",
          videoUrl: "",
          description: "Descrição do vídeo",
        };
        break;
      case "audio":
        newNode.data = {
          label: "Novo Áudio",
          audioUrl: "",
          description: "Descrição do áudio",
        };
        break;
      case "ebook":
        newNode.data = {
          label: "Novo E-book",
          ebookUrl: "",
          description: "Descrição do e-book",
        };
        break;
      case "end":
        newNode.data = {
          label: "Fim",
          message: "Fim do fluxo",
          showContinueButton: false,
          continueButtonText: "Continuar Fluxo",
          connectToFlow: false,
          targetFlowId: "",
        };
        break;
      case "chart":
        newNode.data = {
          label: "Gráfico de Progresso",
          description: "Visualização interativa de progresso do paciente",
          chartType: "progress",
          currentPercentage: 65,
          idealPercentage: 85,
          qualityLevel: "good",
          showQualityInteraction: true,
          patientPosition: 50,
          showPatientPosition: true,
        };
        break;
      case "whatsApp":
        newNode.data = {
          label: "Notificação WhatsApp",
          message: "Olá! Esta é uma mensagem do seu especialista.",
          phoneField: "phone",
          testPhone: "",
        };
        break;
      default:
        break;
    }

    setNodes((nds) => [...nds, newNode]);
    setShowAddNodeDialog(false);
  };

  // Export flow as JSON
  const exportFlow = () => {
    try {
      if (nodes.length === 0) {
        alert("Não há fluxo para exportar.");
        return;
      }

      const flow = {
        name: flowName,
        nodes,
        edges,
        exportedAt: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(flow, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${flowName.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting flow:", error);
      alert("Erro ao exportar o fluxo. Por favor, tente novamente.");
    }
  };

  // Load a saved flow from Supabase
  const loadFlow = (flow) => {
    if (hasUnsavedChanges) {
      const proceed = confirm(
        "Você tem alterações não salvas. Deseja continuar e perdê-las?",
      );
      if (!proceed) return;
    }

    const flowData = flow.flow_data as any;
    setNodes(flowData?.nodes || []);
    setEdges(flowData?.edges || []);
    setFlowName(flow.name);
    setHasUnsavedChanges(false);
    setShowSavedFlowsDialog(false);

    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
    }, 100);
  };

  // Clear the canvas
  const clearCanvas = () => {
    if (
      confirm(
        "Tem certeza que deseja limpar o canvas? Todas as alterações não salvas serão perdidas.",
      )
    ) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setFlowName("Novo Fluxo");
    }
  };

  // Auto-save functionality
  const [lastAutoSave, setLastAutoSave] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedFlows, setSavedFlows] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(false);
  const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
  const [flowAssignments, setFlowAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [realPatients, setRealPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Load assignments when dialog opens
  useEffect(() => {
    if (showAssignmentsDialog) {
      loadFlowAssignments();
    }
  }, [showAssignmentsDialog]);

  // Load real patients when assignment dialog opens
  useEffect(() => {
    if (showAssignmentsDialog) {
      loadRealPatients();
    }
  }, [showAssignmentsDialog]);

  // Load flows when dialog opens
  useEffect(() => {
    if (showSavedFlowsDialog) {
      loadSavedFlows();
    }
  }, [showSavedFlowsDialog]);

  // Function to save flow to Supabase
  const saveFlow = async () => {
    try {
      setSaveError(null);
      if (nodes.length === 0) {
        alert("Não há fluxo para salvar.");
        return;
      }

      setLoadingFlows(true);

      // Prepare flow data
      const flowData = {
        name: flowName,
        nodes,
        edges,
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          lastSaved: new Date().toISOString(),
        },
      };

      // Get current user for RLS compliance
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para salvar fluxos.");
        return;
      }

      // Encode the flow data properly to avoid URL encoding issues
      const { data, error } = await supabase.from("flows").upsert(
        {
          name: flowName,
          flow_data: flowData as any,
          is_active: true,
          created_by: user.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "name,created_by",
        },
      );

      if (error) {
        console.error("Error saving flow:", error);

        // Handle specific error cases
        if (error.code === "42501") {
          // RLS policy violation
          alert(
            `Erro de permissão: ${error.message}. Verifique se você tem permissão para salvar fluxos.`,
          );
        } else if (error.code === "23505") {
          // Unique constraint violation
          const newName = `${flowName} (${new Date().toLocaleTimeString()})`;
          setFlowName(newName);
          alert(
            `Já existe um fluxo com o nome "${flowName}". O nome foi alterado para "${newName}".`,
          );
          // Try again with the new name
          setTimeout(() => saveFlow(), 100);
          return;
        } else {
          // Generic error
          alert(
            `Erro ao salvar o fluxo: ${error.message}. Por favor, tente novamente.`,
          );
        }
        setSaveError(error);
      } else {
        setHasUnsavedChanges(false);
        alert(`Fluxo "${flowName}" salvo com sucesso!`);
        // Refresh the list of saved flows
        loadSavedFlows();
      }
    } catch (error) {
      console.error("Exception saving flow:", error);
      alert(`Erro inesperado ao salvar o fluxo: ${error.message}`);
      setSaveError(error);
    } finally {
      setLoadingFlows(false);
    }
  };

  // Function to load saved flows from Supabase
  const loadSavedFlows = async () => {
    try {
      setLoadingFlows(true);
      setSaveError(null);

      // Implement retry logic
      let retries = 3;
      let success = false;
      let data = null;
      let error = null;

      // Get current user for RLS compliance
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para carregar fluxos.");
        return;
      }

      while (retries > 0 && !success) {
        const response = await supabase
          .from("flows")
          .select("*")
          .eq("created_by", user.id)
          .order("updated_at", { ascending: false });

        data = response.data;
        error = response.error;

        if (error) {
          console.warn(
            `Error loading flows (retries left: ${retries - 1}):`,
            error,
          );
          retries--;
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          success = true;
        }
      }

      if (error) {
        console.error("Failed to load flows after retries:", error);
        alert(`Erro ao carregar fluxos: ${error.message}`);
        setSaveError(error);
        return;
      }

      setSavedFlows(data || []);
    } catch (error) {
      console.error("Exception loading flows:", error);
      alert(`Erro inesperado ao carregar fluxos: ${error.message}`);
      setSaveError(error);
    } finally {
      setLoadingFlows(false);
    }
  };

  // Function to duplicate a flow
  const duplicateFlow = async (flow) => {
    try {
      setSaveError(null);
      const newName = `${flow.name} (Cópia)`;

      // Create a deep copy of the flow data
      const flowData = JSON.parse(JSON.stringify(flow.flow_data));

      // Update the name in the flow data
      if (flowData && typeof flowData === "object") {
        flowData.name = newName;
      }

      // Get current user for RLS compliance
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para duplicar fluxos.");
        return;
      }

      const { data, error } = await supabase.from("flows").insert({
        name: newName,
        flow_data: flowData as any,
        is_active: true,
        description: `Cópia de ${flow.name}`,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error duplicating flow:", error);
        alert(`Erro ao duplicar o fluxo: ${error.message}`);
        setSaveError(error);
      } else {
        alert(`Fluxo "${newName}" duplicado com sucesso!`);
        loadSavedFlows();
      }
    } catch (error) {
      console.error("Exception duplicating flow:", error);
      alert(`Erro inesperado ao duplicar o fluxo: ${error.message}`);
      setSaveError(error);
    }
  };

  // Function to delete a flow
  const deleteFlow = async (flowId, flowName) => {
    if (confirm(`Tem certeza que deseja excluir o fluxo "${flowName}"?`)) {
      try {
        setSaveError(null);
        const { error } = await supabase
          .from("flows")
          .delete()
          .eq("id", flowId);

        if (error) {
          console.error("Error deleting flow:", error);
          alert(`Erro ao excluir o fluxo: ${error.message}`);
          setSaveError(error);
        } else {
          alert(`Fluxo "${flowName}" excluído com sucesso!`);
          loadSavedFlows();
        }
      } catch (error) {
        console.error("Exception deleting flow:", error);
        alert(`Erro inesperado ao excluir o fluxo: ${error.message}`);
        setSaveError(error);
      }
    }
  };

  // Function to load flow assignments
  const loadFlowAssignments = async () => {
    try {
      setLoadingAssignments(true);
      setSaveError(null);

      // Get current user for RLS compliance
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para carregar atribuições.");
        return;
      }

      const { data, error } = await supabase
        .from("flow_assignments")
        .select(
          `
          *,
          flows:flow_id (*)
        `,
        )
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading flow assignments:", error);
        alert(`Erro ao carregar atribuições: ${error.message}`);
        setSaveError(error);
      } else {
        setFlowAssignments(data || []);
      }
    } catch (error) {
      console.error("Exception loading flow assignments:", error);
      alert(`Erro inesperado ao carregar atribuições: ${error.message}`);
      setSaveError(error);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Function to load real patients from Supabase
  const loadRealPatients = async () => {
    try {
      setLoadingPatients(true);
      setSaveError(null);

      // Get current user for RLS compliance
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Você precisa estar logado para carregar pacientes.");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role")
        .eq("role", "patient")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error loading patients:", error);
        alert(`Erro ao carregar pacientes: ${error.message}`);
        setSaveError(error);
      } else {
        setRealPatients(data || []);
      }
    } catch (error) {
      console.error("Exception loading patients:", error);
      alert(`Erro inesperado ao carregar pacientes: ${error.message}`);
      setSaveError(error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Function to assign flow to patients
  const assignFlowToPatients = async (formData) => {
    try {
      setSaveError(null);
      const { selectedPatients, startDate, frequency, repetitions } = formData;

      if (!selectedPatients || selectedPatients.length === 0) {
        alert("Selecione pelo menos um paciente.");
        return;
      }

      // Get the current flow data
      const flowData = {
        name: flowName,
        nodes,
        edges,
      };

      // First, ensure the flow is saved
      let flowId;
      const existingFlow = savedFlows.find((flow) => flow.name === flowName);

      if (existingFlow) {
        flowId = existingFlow.id;
      } else {
        // Get current user for RLS compliance
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          alert("Você precisa estar logado para atribuir fluxos.");
          return;
        }

        // Save the flow first
        const { data, error } = await supabase
          .from("flows")
          .insert({
            name: flowName,
            flow_data: flowData as any,
            is_active: true,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id");

        if (error) {
          console.error("Error saving flow for assignment:", error);
          alert(`Erro ao salvar o fluxo para atribuição: ${error.message}`);
          setSaveError(error);
          return;
        }

        flowId = data[0].id;
      }

      // Get current user for assignments
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) {
        alert("Você precisa estar logado para atribuir fluxos.");
        return;
      }

      // Now create assignments for each selected patient using real patient IDs
      const assignments = selectedPatients.map((patientId) => ({
        flow_id: flowId,
        patient_id: patientId, // Real patient IDs from database
        start_date: startDate,
        frequency: frequency,
        repetitions: repetitions,
        status: "active",
        assigned_by: currentUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("flow_assignments")
        .insert(assignments);

      if (error) {
        console.error("Error creating flow assignments:", error);
        alert(`Erro ao criar atribuições: ${error.message}`);
        setSaveError(error);
      } else {
        alert(
          `Fluxo atribuído com sucesso a ${selectedPatients.length} paciente(s)!`,
        );
        // Refresh assignments
        loadFlowAssignments();
      }
    } catch (error) {
      console.error("Exception assigning flow:", error);
      alert(`Erro inesperado ao atribuir o fluxo: ${error.message}`);
      setSaveError(error);
    }
  };

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true);
      const autoSaveTimer = setTimeout(() => {
        // Auto-save to localStorage every 30 seconds
        const autoSaveData = {
          name: `${flowName} (Auto-save)`,
          nodes,
          edges,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(
          "flowbuilder-autosave",
          JSON.stringify(autoSaveData),
        );
        setLastAutoSave(Date.now());
      }, 30000);

      return () => clearTimeout(autoSaveTimer);
    }
  }, [nodes, edges, flowName]);

  // Load auto-save on component mount
  useEffect(() => {
    const autoSaveData = localStorage.getItem("flowbuilder-autosave");
    if (autoSaveData && nodes.length === 0 && edges.length === 0) {
      try {
        const parsed = JSON.parse(autoSaveData);
        if (
          parsed.nodes &&
          parsed.edges &&
          confirm("Foi encontrado um auto-save recente. Deseja carregá-lo?")
        ) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          setFlowName(parsed.name.replace(" (Auto-save)", ""));
          setHasUnsavedChanges(true);
        }
      } catch (error) {
        console.error("Error loading auto-save:", error);
      }
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+S to save
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        saveFlow();
      }
      // Ctrl+Z to undo (basic implementation)
      if (event.ctrlKey && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        // Basic undo - could be enhanced with proper history management
        if (nodes.length > 0) {
          setNodes(nodes.slice(0, -1));
        }
      }
      // Delete key to remove selected node
      if (event.key === "Delete" && selectedNode) {
        event.preventDefault();
        if (window.deleteNode) {
          window.deleteNode(selectedNode.id);
        }
      }
      // Escape to deselect
      if (event.key === "Escape") {
        setSelectedNode(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nodes, selectedNode]);

  // Validate flow structure
  const validateFlow = () => {
    const issues = [];

    // Check for start node
    const startNodes = nodes.filter((node) => node.type === "startNode");
    if (startNodes.length === 0) {
      issues.push("O fluxo deve ter pelo menos um nó de início.");
    } else if (startNodes.length > 1) {
      issues.push("O fluxo deve ter apenas um nó de início.");
    }

    // Check for end node
    const endNodes = nodes.filter((node) => node.type === "endNode");
    if (endNodes.length === 0) {
      issues.push("O fluxo deve ter pelo menos um nó de fim.");
    }

    // Check for orphaned nodes (nodes without connections)
    const connectedNodeIds = new Set();
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const orphanedNodes = nodes.filter(
      (node) => !connectedNodeIds.has(node.id) && node.type !== "startNode",
    );

    if (orphanedNodes.length > 0) {
      issues.push(
        `${orphanedNodes.length} nó(s) não estão conectados ao fluxo.`,
      );
    }

    // Check for dead ends (nodes that don't lead anywhere except end nodes)
    const deadEnds = nodes.filter((node) => {
      if (node.type === "endNode") return false;
      const outgoingEdges = edges.filter((edge) => edge.source === node.id);
      return outgoingEdges.length === 0;
    });

    if (deadEnds.length > 0) {
      issues.push(
        `${deadEnds.length} nó(s) não têm conexões de saída (exceto nós de fim).`,
      );
    }

    // Check for unreachable nodes (nodes that can't be reached from start)
    const mainStartNodes = startNodes.filter((node) => !node.data.isLinkedFlow);
    const linkedStartNodes = startNodes.filter(
      (node) => node.data.isLinkedFlow,
    );

    if (mainStartNodes.length === 1) {
      const reachableNodes = new Set();
      const queue = [mainStartNodes[0].id];

      // Add all linked start nodes to the queue as well
      linkedStartNodes.forEach((node) => {
        queue.push(node.id);
      });

      while (queue.length > 0) {
        const currentId = queue.shift();
        if (reachableNodes.has(currentId)) continue;

        reachableNodes.add(currentId);
        const outgoingEdges = edges.filter((edge) => edge.source === currentId);
        outgoingEdges.forEach((edge) => {
          if (!reachableNodes.has(edge.target)) {
            queue.push(edge.target);
          }
        });
      }

      const unreachableNodes = nodes.filter(
        (node) => !reachableNodes.has(node.id),
      );
      if (unreachableNodes.length > 0) {
        issues.push(
          `${unreachableNodes.length} nó(s) não podem ser alcançados a partir do início.`,
        );
      }
    }

    // Check for question nodes without options
    const questionNodes = nodes.filter((node) => node.type === "questionNode");
    questionNodes.forEach((node) => {
      if (
        !node.data.textInputOnly &&
        (!node.data.options || node.data.options.length === 0)
      ) {
        issues.push(
          `Pergunta "${node.data.label || "Sem título"}" não tem opções de resposta.`,
        );
      }
    });

    return issues;
  };

  // Play/Pause simulation
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Here you would implement flow simulation logic
    if (!isPlaying) {
      alert("Simulação iniciada! (Funcionalidade em desenvolvimento)");
    }
  };

  return (
    <div
      className={`w-full ${isFullScreen ? "h-screen fixed inset-0 z-50" : "h-[calc(100vh-8rem)]"} border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 dark:border-gray-700 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="w-full sm:w-64 font-medium"
            placeholder="Nome do fluxo"
          />
          <Badge variant="outline" className="text-xs w-fit">
            {nodes.length} nós, {edges.length} conexões
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="destructive" className="text-xs">
              Não salvo
            </Badge>
          )}
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const issues = validateFlow();
              if (issues.length > 0) {
                const issueList = issues
                  .map((issue, index) => `${index + 1}. ${issue}`)
                  .join("\n");
                alert(
                  `⚠️ Problemas encontrados no fluxo:\n\n${issueList}\n\n💡 Corrija estes problemas para garantir o funcionamento adequado do fluxo.`,
                );
              } else {
                alert(
                  "✅ Fluxo válido!\n\nTodos os requisitos foram atendidos. O fluxo está pronto para ser usado.",
                );
              }
            }}
            title="Validar fluxo"
            className="sm:flex"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline">Validar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
            className="sm:flex"
            title={isPlaying ? "Pausar" : "Simular"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">
              {isPlaying ? "Pausar" : "Simular"}
            </span>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" title="Atribuir Fluxo">
                <Users className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Atribuir Fluxo para Pacientes</DialogTitle>
                <DialogDescription>
                  Selecione os pacientes e configure a frequência de execução do
                  fluxo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Selecionar Pacientes</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {[
                      "Maria Silva",
                      "João Santos",
                      "Ana Costa",
                      "Pedro Oliveira",
                    ].map((patient, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`patient-${index}`}
                          className="rounded"
                        />
                        <Label htmlFor={`patient-${index}`}>{patient}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Input type="time" defaultValue="09:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Uma vez</SelectItem>
                      <SelectItem value="daily">Diariamente</SelectItem>
                      <SelectItem value="weekly">Semanalmente</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Número de Repetições</Label>
                  <Input type="number" defaultValue="7" min="1" max="30" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    const formData = {
                      selectedPatients: Array.from(
                        document.querySelectorAll(
                          'input[type="checkbox"]:checked',
                        ),
                      ).map((checkbox) => (checkbox as HTMLInputElement).value),
                      startDate:
                        (
                          document.querySelector(
                            'input[type="date"]',
                          ) as HTMLInputElement
                        )?.value || new Date().toISOString().split("T")[0],
                      frequency:
                        (document.querySelector("select") as HTMLSelectElement)
                          ?.value || "daily",
                      repetitions:
                        parseInt(
                          (
                            document.querySelector(
                              'input[type="number"]',
                            ) as HTMLInputElement
                          )?.value,
                        ) || 7,
                    };
                    assignFlowToPatients(formData);
                  }}
                >
                  Atribuir Fluxo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSavedFlowsDialog(true)}
            title="Fluxos"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Sair" : "Expandir"}
          >
            {isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportFlow}
            title="Exportar"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveFlow}
            className={`${hasUnsavedChanges ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" : ""}`}
            title="Salvar (Ctrl+S)"
          >
            <Save className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAssignmentsDialog(true)}
            title="Ver Atribuições"
          >
            <ListChecks className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
            title="Visualizar"
          >
            <Monitor className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="w-full h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
          minZoom={0.2}
          maxZoom={4}
          snapToGrid={true}
          snapGrid={[15, 15]}
          defaultEdgeOptions={{
            animated: true,
            style: {
              stroke: "#3b82f6",
              strokeWidth: 3,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            },
          }}
          connectionLineStyle={{
            stroke: "#3b82f6",
            strokeWidth: 3,
            strokeDasharray: "5 5",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
          }}
          connectionLineType="straight"
          onEdgeClick={(event, edge) => {
            event.stopPropagation();
            if (
              confirm(`Deseja remover a conexão "${edge.label || "Conexão"}"?`)
            ) {
              setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            }
          }}
          onEdgeMouseEnter={(event, edge) => {
            // Highlight edge on hover
            const edgeElement = (event.target as Element).closest(
              ".react-flow__edge",
            ) as HTMLElement;
            if (edgeElement) {
              edgeElement.style.filter =
                "drop-shadow(0 4px 8px rgba(0,0,0,0.3))";
              edgeElement.style.cursor = "pointer";
            }
          }}
          onEdgeMouseLeave={(event, edge) => {
            // Remove highlight on mouse leave
            const edgeElement = (event.target as Element).closest(
              ".react-flow__edge",
            ) as HTMLElement;
            if (edgeElement) {
              edgeElement.style.filter =
                "drop-shadow(0 2px 4px rgba(0,0,0,0.1))";
              edgeElement.style.cursor = "default";
            }
          }}
        >
          <Controls className="flow-controls-mobile [&>button]:!text-xs [&>button]:!p-1 [&>button]:!min-w-[32px] [&>button]:!h-8" />
          <MiniMap
            className="flow-minimap-mobile !w-32 !h-24 sm:!w-40 sm:!h-32"
            nodeStrokeWidth={3}
            zoomable
            pannable
            nodeColor={(node) => {
              switch (node.type) {
                case "startNode":
                  return "#d1fae5";
                case "questionNode":
                  return "#dbeafe";
                case "messageNode":
                  return "#dcfce7";
                case "videoNode":
                  return "#f3e8ff";
                case "audioNode":
                  return "#fed7aa";
                case "ebookNode":
                  return "#e0e7ff";
                case "chartNode":
                  return "#e0f2fe";
                case "endNode":
                  return "#f3f4f6";
                default:
                  return "#f3f4f6";
              }
            }}
          />
          <Background
            color="#9ca3af"
            gap={16}
            size={2}
            variant="dots"
            className="bg-gray-100 dark:bg-gray-800"
          />

          {/* Mobile-Responsive Toolbar */}
          <Panel position="top-left" className="flex flex-col space-y-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 max-w-[90vw] sm:max-w-none">
              <div className="flex items-center justify-between mb-2">
                {!isToolbarCollapsed && (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ferramentas
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
                  title={isToolbarCollapsed ? "Expandir" : "Recolher"}
                >
                  {isToolbarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div
                className={`${isToolbarCollapsed ? "flex flex-col gap-1" : "grid grid-cols-2 sm:flex sm:flex-col gap-2"}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("start")}
                  title="Início"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <Play className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">Início</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("question")}
                  title="Pergunta"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  {!isToolbarCollapsed && (
                    <span className="ml-2">Pergunta</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("message")}
                  title="Mensagem"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {!isToolbarCollapsed && (
                    <span className="ml-2">Mensagem</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("video")}
                  title="Vídeo"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <Video className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">Vídeo</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("audio")}
                  title="Áudio"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <Music className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">Áudio</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("ebook")}
                  title="E-book"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <BookOpen className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">E-book</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("chart")}
                  title="Gráfico"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <BarChart3 className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">Gráfico</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("end")}
                  title="Fim"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <Flag className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">Fim</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addNode("whatsApp")}
                  title="WhatsApp"
                  className={`${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm"}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  {!isToolbarCollapsed && (
                    <span className="ml-2">WhatsApp</span>
                  )}
                </Button>
                {!isToolbarCollapsed && (
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 col-span-2 sm:col-span-1" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCanvas}
                  title="Limpar"
                  className={`text-red-500 hover:text-red-600 ${isToolbarCollapsed ? "justify-center p-2" : "justify-start text-xs sm:text-sm col-span-2 sm:col-span-1"}`}
                >
                  <Trash2 className="h-4 w-4" />
                  {!isToolbarCollapsed && <span className="ml-2">Limpar</span>}
                </Button>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Add Node Dialog */}
      <Dialog open={showAddNodeDialog} onOpenChange={setShowAddNodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nó</DialogTitle>
            <DialogDescription>
              Selecione o tipo de nó que deseja adicionar ao fluxo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("start")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-lg">Início</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("question")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Pergunta</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("message")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">Mensagem</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("video")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-lg">Vídeo</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("audio")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                  <Music className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Áudio</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("ebook")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-indigo-500" />
                </div>
                <CardTitle className="text-lg">E-book</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("chart")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-sky-500" />
                </div>
                <CardTitle className="text-lg">Gráfico</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("end")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Flag className="h-6 w-6 text-gray-500" />
                </div>
                <CardTitle className="text-lg">Fim</CardTitle>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => addNode("whatsApp")}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle className="text-lg">WhatsApp</CardTitle>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddNodeDialog(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Saved Flows Dialog */}
      {saveError && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50 max-w-md">
          <div className="flex items-center">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm1.41-1.41A8 8 0 1 0 15.66 4.34 8 8 0 0 0 4.34 15.66zm9.9-8.49L11.41 10l2.83 2.83-1.41 1.41L10 11.41l-2.83 2.83-1.41-1.41L8.59 10 5.76 7.17l1.41-1.41L10 8.59l2.83-2.83 1.41 1.41z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Erro ao salvar</p>
              <p className="text-sm">
                {saveError.message ||
                  "Ocorreu um erro ao processar sua solicitação"}
              </p>
              <p className="text-xs mt-1">
                Código: {saveError.code || "Desconhecido"}
              </p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="ml-auto bg-transparent text-red-700 hover:text-red-800 font-semibold hover:bg-red-200 py-1 px-2 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <Dialog
        open={showSavedFlowsDialog}
        onOpenChange={setShowSavedFlowsDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Fluxos Salvos</DialogTitle>
            <DialogDescription>
              Gerencie seus fluxos salvos - abrir, duplicar ou excluir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4 max-h-96 overflow-y-auto">
            {loadingFlows ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-sm text-muted-foreground">
                  Carregando fluxos...
                </p>
              </div>
            ) : savedFlows.length > 0 ? (
              savedFlows.map((flow) => {
                const flowData = flow.flow_data as any;
                return (
                  <Card
                    key={flow.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{flow.name}</CardTitle>
                        <Badge variant="default">ativo</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        {flowData?.metadata?.nodeCount ||
                          flowData?.nodes?.length ||
                          0}{" "}
                        nós,{" "}
                        {flowData?.metadata?.edgeCount ||
                          flowData?.edges?.length ||
                          0}{" "}
                        conexões
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Atualizado em{" "}
                        {new Date(
                          flow.updated_at || flow.created_at,
                        ).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => loadFlow(flow)}
                        >
                          <FolderOpen className="h-4 w-4 mr-1" />
                          Abrir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateFlow(flow)}
                          title="Duplicar fluxo"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFlow(flow.id, flow.name)}
                          title="Excluir fluxo"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                  <FolderOpen className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Nenhum fluxo salvo</h3>
                <p className="text-sm text-muted-foreground">
                  Crie e salve seu primeiro fluxo para vê-lo aqui.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSavedFlowsDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Flow Assignments Dialog */}
      <Dialog
        open={showAssignmentsDialog}
        onOpenChange={setShowAssignmentsDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Atribuições de Fluxos</DialogTitle>
            <DialogDescription>
              Visualize todas as atribuições de fluxos para pacientes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {loadingAssignments ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-sm text-muted-foreground">
                  Carregando atribuições...
                </p>
              </div>
            ) : flowAssignments.length > 0 ? (
              <div className="space-y-4">
                {flowAssignments.map((assignment) => {
                  const mockPatientNames = {
                    "patient-1": "Maria Silva",
                    "patient-2": "João Santos",
                    "patient-3": "Ana Costa",
                    "patient-4": "Pedro Oliveira",
                  };

                  return (
                    <Card key={assignment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">
                            {assignment.flows.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Paciente:{" "}
                            {mockPatientNames[assignment.patient_id] ||
                              assignment.patient_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Frequência:{" "}
                            {assignment.frequency === "daily"
                              ? "Diariamente"
                              : assignment.frequency === "weekly"
                                ? "Semanalmente"
                                : assignment.frequency === "once"
                                  ? "Uma vez"
                                  : "Personalizado"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Repetições: {assignment.repetitions || "N/A"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Início:{" "}
                            {new Date(
                              assignment.start_date,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            assignment.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {assignment.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
                  <ListChecks className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">
                  Nenhuma atribuição encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Atribua fluxos aos pacientes para vê-los aqui.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignmentsDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Patient Preview Sheet */}
      <Sheet open={showPreview} onOpenChange={setShowPreview}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Visualização do Paciente</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <PatientPreview
              nodes={nodes}
              edges={edges}
              currentStep={previewCurrentStep}
              onStepChange={setPreviewCurrentStep}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Patient Preview Component
const PatientPreview = ({ nodes, edges, currentStep, onStepChange }) => {
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [textAnswers, setTextAnswers] = useState({});
  const [canProceed, setCanProceed] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [chartData, setChartData] = useState({
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
    values: [30, 45, 55, 60, 70, 65],
    trend: "up",
  });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animation effect for chart rendering in patient preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Generate random chart data for demo purposes in patient preview
  useEffect(() => {
    const currentNode = nodes[currentStep] || nodes[0];
    if (
      currentNode &&
      currentNode.type === "chartNode" &&
      currentNode.data.useRandomData
    ) {
      const generateRandomData = () => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
        const values = Array.from(
          { length: 6 },
          () => Math.floor(Math.random() * 70) + 20,
        );
        const trend = values[values.length - 1] > values[0] ? "up" : "down";

        setChartData({
          labels: months,
          values: values,
          trend: trend,
        });
      };

      generateRandomData();
      const interval = setInterval(generateRandomData, 5000);
      return () => clearInterval(interval);
    }
  }, [currentStep, nodes]);

  // Check if user can proceed to next step based on current node type and answers
  useEffect(() => {
    const currentNode = nodes[currentStep] || nodes[0];
    if (!currentNode) return;

    // Start node and message node can always proceed
    if (
      currentNode.type === "startNode" ||
      currentNode.type === "messageNode" ||
      currentNode.type === "videoNode" ||
      currentNode.type === "audioNode" ||
      currentNode.type === "ebookNode" ||
      currentNode.type === "endNode" ||
      currentNode.type === "chartNode" ||
      currentNode.type === "whatsAppNode"
    ) {
      setCanProceed(true);
      return;
    }

    // For question nodes, check if an answer is provided
    if (currentNode.type === "questionNode") {
      if (currentNode.data.textInputOnly) {
        // Text input only question requires text answer
        setCanProceed(
          !!textAnswers[currentNode.id] &&
            textAnswers[currentNode.id].trim() !== "",
        );
      } else if (
        currentNode.data.allowTextInput &&
        textAnswers[currentNode.id] &&
        textAnswers[currentNode.id].trim() !== ""
      ) {
        // If text answer is provided when allowed
        setCanProceed(true);
      } else {
        // Check if options are selected
        const hasSelectedOptions =
          selectedOptions[currentNode.id] &&
          selectedOptions[currentNode.id].length > 0;
        setCanProceed(hasSelectedOptions);
      }
      return;
    }

    // Default to not allowing proceed
    setCanProceed(false);
  }, [currentStep, nodes, selectedOptions, textAnswers]);

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
          <HelpCircle className="h-6 w-6 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium mb-1">Nenhum fluxo criado</h3>
        <p className="text-sm text-muted-foreground">
          Adicione nós ao fluxo para ver a visualização do paciente.
        </p>
      </div>
    );
  }

  const currentNode = nodes[currentStep] || nodes[0];
  const isLastStep = currentStep >= nodes.length - 1;

  const handleNext = async () => {
    if (!canProceed) return;

    const currentNode = nodes[currentStep];
    let nextNodeId = null;

    // Execute WhatsApp notification if the current node is a WhatsApp node
    if (currentNode.type === "whatsAppNode") {
      // In a real implementation, this would use actual patient data
      // For the preview, we'll just simulate the execution
      console.log("Simulating WhatsApp notification in preview mode");
      // In real execution mode, this would call executeWhatsAppNotification(currentNode.data, patientData)
    }

    // Determine next node based on current node type and user choices
    if (currentNode.type === "questionNode") {
      if (currentNode.data.textInputOnly) {
        // For text-only questions, find the single connected node
        const connection = edges.find((edge) => edge.source === currentNode.id);
        if (connection) {
          nextNodeId = connection.target;
        }
      } else {
        // For option-based questions, find connection based on selected option
        const selectedOptionIndices = selectedOptions[currentNode.id] || [];
        if (selectedOptionIndices.length > 0) {
          // Use the first selected option to determine path
          const selectedIndex = selectedOptionIndices[0];
          const connection = edges.find(
            (edge) =>
              edge.source === currentNode.id &&
              (edge.sourceHandle === `option-${selectedIndex}` ||
                !edge.sourceHandle),
          );
          if (connection) {
            nextNodeId = connection.target;
          }
        } else if (
          textAnswers[currentNode.id] &&
          textAnswers[currentNode.id].trim() !== ""
        ) {
          // If text answer is provided, find any connection
          const connection = edges.find(
            (edge) => edge.source === currentNode.id,
          );
          if (connection) {
            nextNodeId = connection.target;
          }
        }
      }
    } else {
      // For other node types, find any connection
      const connection = edges.find((edge) => edge.source === currentNode.id);
      if (connection) {
        nextNodeId = connection.target;
      }
    }

    if (nextNodeId) {
      const nextNodeIndex = nodes.findIndex((node) => node.id === nextNodeId);
      if (nextNodeIndex !== -1) {
        // Add current node to visited nodes if not already there
        if (!visitedNodes.includes(currentStep)) {
          setVisitedNodes((prev) => [...prev, currentStep]);
        }
        // Update current path
        setCurrentPath((prev) => [
          ...prev.slice(0, currentStep + 1),
          nextNodeIndex,
        ]);
        onStepChange(nextNodeIndex);
        setCanProceed(false);
      }
    } else if (!isLastStep) {
      // Fallback to sequential navigation if no connections found
      if (!visitedNodes.includes(currentStep)) {
        setVisitedNodes((prev) => [...prev, currentStep]);
      }
      setCurrentPath((prev) => [
        ...prev.slice(0, currentStep + 1),
        currentStep + 1,
      ]);
      onStepChange(currentStep + 1);
      setCanProceed(false);
    }
  };

  const handlePrevious = () => {
    if (currentPath.length > 1) {
      const newPath = currentPath.slice(0, -1);
      setCurrentPath(newPath);
      const previousStep = newPath[newPath.length - 1];
      onStepChange(previousStep);
    } else if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleOptionSelect = (nodeId, optionIndex, isMultiple = false) => {
    if (isMultiple) {
      const current = selectedOptions[nodeId] || [];
      const newSelection = current.includes(optionIndex)
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
      setSelectedOptions({ ...selectedOptions, [nodeId]: newSelection });
    } else {
      setSelectedOptions({ ...selectedOptions, [nodeId]: [optionIndex] });
    }
  };

  const handleTextAnswer = (nodeId, value) => {
    setTextAnswers({ ...textAnswers, [nodeId]: value });
  };

  const renderNode = (node) => {
    switch (node.type) {
      case "startNode":
        return (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2 flex items-center justify-center">
              <Play className="h-5 w-5 mr-2 text-emerald-500" />
              {node.data.label || "Início"}
            </h3>

            {node.data.subtitle && (
              <h4 className="font-medium text-emerald-600 dark:text-emerald-400 mb-3 text-center">
                {node.data.subtitle}
              </h4>
            )}

            {/* Media display */}
            {node.data.mediaUrl &&
              node.data.mediaType &&
              node.data.mediaType !== "none" && (
                <div className="mb-4">
                  {node.data.mediaType === "image" && (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center mb-3">
                      <Image className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  {node.data.mediaType === "video" && (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center mb-3">
                      <Video className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                  {node.data.mediaType === "audio" && (
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-16 flex items-center justify-center mb-3">
                      <Music className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
              )}

            <p className="text-gray-600 dark:text-gray-300">
              {node.data.message || "Início do fluxo"}
            </p>
          </div>
        );

      case "questionNode":
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-2">
                {node.data.label || "Pergunta"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {node.data.question || "Qual é a sua pergunta?"}
              </p>

              {node.data.textInputOnly ? (
                // Only show text input field
                <div>
                  <Textarea
                    placeholder="Digite sua resposta aqui..."
                    value={textAnswers[node.id] || ""}
                    onChange={(e) => handleTextAnswer(node.id, e.target.value)}
                    className="w-full"
                    rows={4}
                  />
                </div>
              ) : (
                // Show options with optional text input
                <>
                  <div className="space-y-2">
                    {(node.data.options || ["Opção 1", "Opção 2"]).map(
                      (option, index) => {
                        const isSelected = (
                          selectedOptions[node.id] || []
                        ).includes(index);
                        const isMultiple =
                          node.data.questionType === "multiple";

                        return (
                          <div
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500"
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                            onClick={() =>
                              handleOptionSelect(node.id, index, isMultiple)
                            }
                          >
                            <div className="flex items-center">
                              {isMultiple ? (
                                <div
                                  className={`w-3 h-3 border-2 rounded mr-3 flex items-center justify-center ${
                                    isSelected
                                      ? "bg-blue-500 border-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                              ) : (
                                <div
                                  className={`w-3 h-3 border-2 rounded-full mr-3 flex items-center justify-center ${
                                    isSelected
                                      ? "bg-blue-500 border-blue-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  )}
                                </div>
                              )}
                              <span>{option}</span>
                              {node.data.useEmojis && (
                                <span className="ml-2">😊</span>
                              )}
                              {node.data.useImages && (
                                <Image className="h-3 w-3 ml-2 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>

                  {/* Text input option */}
                  {node.data.allowTextInput && (
                    <div className="mt-4">
                      <Label className="text-sm font-medium mb-2 block">
                        Ou digite sua resposta:
                      </Label>
                      <Textarea
                        placeholder="Digite sua resposta aqui..."
                        value={textAnswers[node.id] || ""}
                        onChange={(e) =>
                          handleTextAnswer(node.id, e.target.value)
                        }
                        className="w-full"
                        rows={3}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case "messageNode":
        return (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-green-500" />
              {node.data.label || "Mensagem"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {node.data.message || "Conteúdo da mensagem"}
            </p>
          </div>
        );

      case "videoNode":
        return (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <Video className="h-5 w-5 mr-2 text-purple-500" />
              {node.data.label || "Vídeo"}
            </h3>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        );

      case "audioNode":
        return (
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <Music className="h-5 w-5 mr-2 text-orange-500" />
              {node.data.label || "Áudio"}
            </h3>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-16 flex items-center justify-center">
              <Play className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        );

      case "ebookNode":
        return (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
              {node.data.label || "E-book"}
            </h3>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-gray-500" />
            </div>
          </div>
        );

      case "endNode":
        return (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-center">
            <h3 className="font-medium text-lg mb-2 flex items-center justify-center">
              <Flag className="h-5 w-5 mr-2 text-gray-500" />
              {node.data.label || "Fim"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              {node.data.message || "Fim do fluxo"}
            </p>
            {node.data.showContinueButton && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  {node.data.continueButtonText || "Continuar Fluxo"}
                </Button>
              </div>
            )}
          </div>
        );

      case "chartNode":
        const renderChartPreviewInVisualizer = () => {
          const currentPerc = node.data.currentPercentage || 65;
          const idealPerc = node.data.idealPercentage || 85;
          const patientPos = node.data.patientPosition || 50;
          const comparisonValue = node.data.comparisonValue || 40;
          const animatedCurrentPerc = currentPerc * animationProgress;
          const animatedIdealPerc = idealPerc * animationProgress;
          const animatedPatientPos = patientPos * animationProgress;
          const animatedComparisonValue = comparisonValue * animationProgress;

          const getQualityColor = () => {
            switch (node.data.qualityLevel) {
              case "excellent":
                return "#10b981";
              case "good":
                return "#3b82f6";
              case "fair":
                return "#f59e0b";
              case "poor":
                return "#ef4444";
              default:
                return "#3b82f6";
            }
          };

          const renderTrendIndicator = () => {
            if (!node.data.showTrendIndicator) return null;

            const trend =
              chartData.trend ||
              (currentPerc > comparisonValue ? "up" : "down");
            const trendColor = trend === "up" ? "#10b981" : "#ef4444";
            const TrendIcon = trend === "up" ? TrendingUp : ArrowDown;

            return (
              <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm transform -translate-y-1/2 translate-x-1/2">
                <div
                  className={`rounded-full p-1 ${trend === "up" ? "bg-green-100" : "bg-red-100"}`}
                  style={{
                    boxShadow: isHovered ? `0 0 8px ${trendColor}` : "none",
                  }}
                >
                  <TrendIcon
                    className={`h-3 w-3 ${trend === "up" ? "text-green-500" : "text-red-500"}`}
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 0 3px ${trendColor})`
                        : "none",
                    }}
                  />
                </div>
              </div>
            );
          };

          switch (node.data.chartType || "progress") {
            case "progress":
              return (
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Atual: {currentPerc}%</span>
                    <span>Ideal: {idealPerc}%</span>
                    {node.data.showPatientPosition && (
                      <span>Paciente: {patientPos}%</span>
                    )}
                    {node.data.showComparison && (
                      <span>Anterior: {comparisonValue}%</span>
                    )}
                  </div>
                  <div className="relative">
                    {/* Comparison background if enabled */}
                    {node.data.showComparison && (
                      <div
                        className="absolute top-0 h-4 bg-gray-300 dark:bg-gray-600 opacity-30 rounded-full transition-all duration-700"
                        style={{
                          width: `${animatedComparisonValue}%`,
                          zIndex: 1,
                        }}
                      />
                    )}

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden relative">
                      {/* Current progress with gradient */}
                      <div
                        className="h-4 rounded-full transition-all duration-1000 ease-out relative z-10"
                        style={{
                          width: `${animatedCurrentPerc}%`,
                          background: `linear-gradient(90deg, ${getQualityColor()}, ${getQualityColor()}aa)`,
                          boxShadow: isHovered
                            ? `0 0 10px ${getQualityColor()}66`
                            : "none",
                        }}
                      >
                        {/* Animated pulse effect at the end of progress bar */}
                        <div
                          className="absolute right-0 top-0 h-full w-2 rounded-full animate-pulse"
                          style={{
                            background: `radial-gradient(circle, ${getQualityColor()}, transparent)`,
                            opacity: isHovered ? 0.8 : 0.4,
                          }}
                        />
                      </div>

                      {/* Ideal marker */}
                      <div
                        className="absolute top-0 w-1 h-4 bg-green-500 rounded-full transition-all duration-500 z-20"
                        style={{
                          left: `${animatedIdealPerc}%`,
                          transform: "translateX(-50%)",
                          boxShadow: isHovered ? "0 0 8px #10b981" : "none",
                        }}
                      />

                      {/* Patient position marker */}
                      {node.data.showPatientPosition && (
                        <div
                          className="absolute top-0 w-2 h-4 bg-purple-500 rounded-full transition-all duration-700 flex items-center justify-center z-20"
                          style={{
                            left: `${animatedPatientPos}%`,
                            transform: "translateX(-50%)",
                            boxShadow: isHovered ? "0 0 8px #8b5cf6" : "none",
                          }}
                        >
                          <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        </div>
                      )}
                    </div>

                    {renderTrendIndicator()}
                  </div>

                  {/* Interactive quality indicator */}
                  {node.data.showQualityInteraction && (
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center space-x-2 rounded-full px-3 py-1 transition-all duration-300 ${
                          isHovered
                            ? "bg-opacity-80 scale-105"
                            : "bg-opacity-60"
                        }`}
                        style={{ backgroundColor: `${getQualityColor()}20` }}
                      >
                        <div
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            isHovered ? "animate-pulse" : ""
                          }`}
                          style={{ backgroundColor: getQualityColor() }}
                        />
                        <span className="text-xs font-medium">
                          {node.data.qualityLevel === "excellent"
                            ? "🌟 Excelente"
                            : node.data.qualityLevel === "good"
                              ? "✅ Bom"
                              : node.data.qualityLevel === "fair"
                                ? "⚠️ Regular"
                                : "🔴 Precisa Melhorar"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            case "circular":
              const circularRadius = 30;
              const circumference = 2 * Math.PI * circularRadius;
              const strokeDasharray = `${(animatedCurrentPerc / 100) * circumference} ${circumference}`;
              const idealStrokeDasharray = `${(animatedIdealPerc / 100) * circumference} ${circumference}`;
              const patientStrokeDasharray = `${(animatedPatientPos / 100) * circumference} ${circumference}`;
              const comparisonStrokeDasharray = `${(animatedComparisonValue / 100) * circumference} ${circumference}`;

              return (
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="40"
                        cy="40"
                        r={circularRadius}
                        stroke="#e5e7eb"
                        strokeWidth="6"
                        fill="transparent"
                      />

                      {/* Comparison circle if enabled */}
                      {node.data.showComparison && (
                        <circle
                          cx="40"
                          cy="40"
                          r={circularRadius}
                          stroke="#94a3b8"
                          strokeWidth="6"
                          fill="transparent"
                          strokeDasharray={comparisonStrokeDasharray}
                          strokeLinecap="round"
                          opacity="0.3"
                          className="transition-all duration-1000"
                        />
                      )}

                      {/* Ideal progress (background) */}
                      <circle
                        cx="40"
                        cy="40"
                        r={circularRadius}
                        stroke="#10b981"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={idealStrokeDasharray}
                        strokeLinecap="round"
                        opacity="0.4"
                        className="transition-all duration-1000"
                      />

                      {/* Patient position */}
                      {node.data.showPatientPosition && (
                        <circle
                          cx="40"
                          cy="40"
                          r={circularRadius}
                          stroke="#8b5cf6"
                          strokeWidth="4"
                          fill="transparent"
                          strokeDasharray={patientStrokeDasharray}
                          strokeLinecap="round"
                          opacity="0.7"
                          className="transition-all duration-700"
                          style={{
                            filter: isHovered
                              ? "drop-shadow(0 0 6px #8b5cf6)"
                              : "none",
                          }}
                        />
                      )}

                      {/* Current progress */}
                      <circle
                        cx="40"
                        cy="40"
                        r={circularRadius}
                        stroke={getQualityColor()}
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={strokeDasharray}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 8px ${getQualityColor()})`
                            : "none",
                        }}
                      />

                      {/* Animated dot at the end of progress */}
                      <circle
                        cx={
                          40 +
                          circularRadius *
                            Math.cos(
                              (animatedCurrentPerc / 100) * 2 * Math.PI -
                                Math.PI / 2,
                            )
                        }
                        cy={
                          40 +
                          circularRadius *
                            Math.sin(
                              (animatedCurrentPerc / 100) * 2 * Math.PI -
                                Math.PI / 2,
                            )
                        }
                        r="3"
                        fill={getQualityColor()}
                        className={isHovered ? "animate-pulse" : ""}
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 3px ${getQualityColor()})`
                            : "none",
                        }}
                      />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className={`text-sm font-bold transition-all duration-300 ${
                          isHovered ? "scale-110" : ""
                        }`}
                      >
                        {currentPerc}%
                      </span>
                    </div>

                    {node.data.showTrendIndicator && (
                      <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                        <div
                          className={`rounded-full p-1 ${currentPerc > (node.data.showComparison ? comparisonValue : 50) ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {currentPerc >
                          (node.data.showComparison ? comparisonValue : 50) ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-center space-y-1">
                    <div className="text-gray-600 dark:text-gray-400">
                      Meta: {idealPerc}%
                    </div>
                    {node.data.showPatientPosition && (
                      <div className="text-purple-600 dark:text-purple-400">
                        👤 Paciente: {patientPos}%
                      </div>
                    )}
                    {node.data.showComparison && (
                      <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Anterior: {comparisonValue}%
                        <span className="ml-1">
                          {currentPerc > comparisonValue ? (
                            <span className="text-green-500">
                              ↑{currentPerc - comparisonValue}%
                            </span>
                          ) : currentPerc < comparisonValue ? (
                            <span className="text-red-500">
                              ↓{comparisonValue - currentPerc}%
                            </span>
                          ) : (
                            <span className="text-gray-500">=</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            case "bar":
              return (
                <div className="flex items-end justify-center space-x-3 h-16">
                  {/* Comparison bar if enabled */}
                  {node.data.showComparison && (
                    <div className="flex flex-col items-center">
                      <div
                        className="bg-gray-400 dark:bg-gray-600 rounded-t w-6 transition-all duration-700 opacity-40"
                        style={{
                          height: `${(animatedComparisonValue / 100) * 60}px`,
                        }}
                      />
                      <span className="text-xs mt-1">Anterior</span>
                    </div>
                  )}

                  {/* Current value bar */}
                  <div className="flex flex-col items-center">
                    <div
                      className="rounded-t w-6 transition-all duration-1000 ease-out relative"
                      style={{
                        height: `${(animatedCurrentPerc / 100) * 60}px`,
                        background: `linear-gradient(to top, ${getQualityColor()}, ${getQualityColor()}aa)`,
                        boxShadow: isHovered
                          ? `0 0 10px ${getQualityColor()}66`
                          : "none",
                      }}
                    >
                      {/* Animated pulse at top of bar */}
                      <div
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full animate-pulse"
                        style={{
                          background: getQualityColor(),
                          opacity: isHovered ? 0.8 : 0.4,
                        }}
                      />

                      {node.data.showTrendIndicator &&
                        currentPerc >
                          (node.data.showComparison ? comparisonValue : 50) && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          </div>
                        )}

                      {node.data.showTrendIndicator &&
                        currentPerc <
                          (node.data.showComparison ? comparisonValue : 50) && (
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          </div>
                        )}
                    </div>
                    <span className="text-xs mt-1">Atual</span>
                  </div>

                  {/* Ideal bar */}
                  <div className="flex flex-col items-center">
                    <div
                      className="bg-green-500 rounded-t w-6 transition-all duration-700"
                      style={{
                        height: `${(animatedIdealPerc / 100) * 60}px`,
                        boxShadow: isHovered ? "0 0 8px #10b981" : "none",
                      }}
                    />
                    <span className="text-xs mt-1">Ideal</span>
                  </div>

                  {/* Patient position bar */}
                  {node.data.showPatientPosition && (
                    <div className="flex flex-col items-center">
                      <div
                        className="bg-purple-500 rounded-t w-6 transition-all duration-500 relative"
                        style={{
                          height: `${(animatedPatientPos / 100) * 60}px`,
                          boxShadow: isHovered ? "0 0 8px #8b5cf6" : "none",
                        }}
                      >
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
                      </div>
                      <span className="text-xs mt-1">👤</span>
                    </div>
                  )}
                </div>
              );
            case "line":
              // Line chart implementation
              const maxValue = Math.max(...chartData.values, 100);
              const chartHeight = 60;
              const chartWidth = 180;

              // Calculate points for the line
              const points = chartData.values
                .map((value, index) => {
                  const x =
                    (index / (chartData.values.length - 1)) * chartWidth;
                  const y = chartHeight - (value / maxValue) * chartHeight;
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <div className="flex flex-col items-center">
                  <div className="relative w-full h-16">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      preserveAspectRatio="none"
                    >
                      {/* Grid lines */}
                      <line
                        x1="0"
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                      <line
                        x1="0"
                        y1={chartHeight / 2}
                        x2={chartWidth}
                        y2={chartHeight / 2}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />

                      {/* Line chart */}
                      <polyline
                        points={points}
                        fill="none"
                        stroke={getQualityColor()}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 3px ${getQualityColor()})`
                            : "none",
                          transition: "all 0.3s ease",
                        }}
                      />

                      {/* Dots at data points */}
                      {chartData.values.map((value, index) => {
                        const x =
                          (index / (chartData.values.length - 1)) * chartWidth;
                        const y =
                          chartHeight - (value / maxValue) * chartHeight;
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={getQualityColor()}
                            className={
                              index === chartData.values.length - 1
                                ? "animate-pulse"
                                : ""
                            }
                            style={{
                              filter: isHovered
                                ? `drop-shadow(0 0 2px ${getQualityColor()})`
                                : "none",
                            }}
                          />
                        );
                      })}

                      {/* Current percentage marker */}
                      <line
                        x1="0"
                        y1={
                          chartHeight - (currentPerc / maxValue) * chartHeight
                        }
                        x2={chartWidth}
                        y2={
                          chartHeight - (currentPerc / maxValue) * chartHeight
                        }
                        stroke={getQualityColor()}
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />

                      {/* Ideal percentage marker */}
                      <line
                        x1="0"
                        y1={chartHeight - (idealPerc / maxValue) * chartHeight}
                        x2={chartWidth}
                        y2={chartHeight - (idealPerc / maxValue) * chartHeight}
                        stroke="#10b981"
                        strokeWidth="1"
                        strokeDasharray="3,3"
                        opacity="0.5"
                      />
                    </svg>

                    {node.data.showTrendIndicator && (
                      <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm transform -translate-y-1/2 translate-x-1/2">
                        <div
                          className={`rounded-full p-1 ${chartData.trend === "up" ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {chartData.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDown className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* X-axis labels */}
                  <div className="flex justify-between w-full px-1 mt-1">
                    {chartData.labels.map((label, index) => (
                      <span key={index} className="text-xs text-gray-500">
                        {label}
                      </span>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <div
                        className="w-2 h-2 rounded-full mr-1"
                        style={{ backgroundColor: getQualityColor() }}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Atual: {currentPerc}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-1 bg-green-500"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Meta: {idealPerc}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            case "radar":
              // Radar chart implementation
              const categories = [
                "Físico",
                "Mental",
                "Social",
                "Emocional",
                "Espiritual",
              ];
              const values = node.data.useRandomData
                ? [65, 80, 55, 70, 60]
                : [
                    currentPerc,
                    idealPerc,
                    patientPos,
                    comparisonValue,
                    (currentPerc + idealPerc) / 2,
                  ];

              const centerX = 50;
              const centerY = 50;
              const radarRadius = 40;

              // Calculate points for the radar chart
              const radarPoints = values
                .map((value, index) => {
                  const angle =
                    (Math.PI * 2 * index) / values.length - Math.PI / 2;
                  const x =
                    centerX + ((radarRadius * value) / 100) * Math.cos(angle);
                  const y =
                    centerY + ((radarRadius * value) / 100) * Math.sin(angle);
                  return `${x},${y}`;
                })
                .join(" ");

              // Calculate points for the background grid
              const createGridPoints = (percentage) => {
                return categories
                  .map((_, index) => {
                    const angle =
                      (Math.PI * 2 * index) / categories.length - Math.PI / 2;
                    const x =
                      centerX +
                      ((radarRadius * percentage) / 100) * Math.cos(angle);
                    const y =
                      centerY +
                      ((radarRadius * percentage) / 100) * Math.sin(angle);
                    return `${x},${y}`;
                  })
                  .join(" ");
              };

              return (
                <div className="flex flex-col items-center">
                  <div className="relative w-full h-32">
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Background grid */}
                      {[25, 50, 75, 100].map((percentage) => (
                        <polygon
                          key={percentage}
                          points={createGridPoints(percentage)}
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="0.5"
                          opacity={0.5}
                        />
                      ))}

                      {/* Axes */}
                      {categories.map((_, index) => {
                        const angle =
                          (Math.PI * 2 * index) / categories.length -
                          Math.PI / 2;
                        const x = centerX + radarRadius * Math.cos(angle);
                        const y = centerY + radarRadius * Math.sin(angle);
                        return (
                          <line
                            key={index}
                            x1={centerX}
                            y1={centerY}
                            x2={x}
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                          />
                        );
                      })}

                      {/* Data polygon */}
                      <polygon
                        points={radarPoints}
                        fill={`${getQualityColor()}33`}
                        stroke={getQualityColor()}
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        style={{
                          filter: isHovered
                            ? `drop-shadow(0 0 3px ${getQualityColor()})`
                            : "none",
                          transition: "all 0.3s ease",
                        }}
                      />

                      {/* Data points */}
                      {values.map((value, index) => {
                        const angle =
                          (Math.PI * 2 * index) / values.length - Math.PI / 2;
                        const x =
                          centerX +
                          ((radarRadius * value) / 100) * Math.cos(angle);
                        const y =
                          centerY +
                          ((radarRadius * value) / 100) * Math.sin(angle);
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={getQualityColor()}
                            style={{
                              filter: isHovered
                                ? `drop-shadow(0 0 2px ${getQualityColor()})`
                                : "none",
                            }}
                          />
                        );
                      })}

                      {/* Category labels */}
                      {categories.map((category, index) => {
                        const angle =
                          (Math.PI * 2 * index) / categories.length -
                          Math.PI / 2;
                        const x = centerX + (radarRadius + 10) * Math.cos(angle);
                        const y = centerY + (radarRadius + 10) * Math.sin(angle);
                        return (
                          <text
                            key={index}
                            x={x}
                            y={y}
                            fontSize="4"
                            fill="currentColor"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {category}
                          </text>
                        );
                      })}
                    </svg>

                    {node.data.showTrendIndicator && (
                      <div className="absolute top-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm">
                        <div className="rounded-full p-1 bg-green-100">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center mt-1">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 mr-1 rounded-sm"
                        style={{
                          backgroundColor: `${getQualityColor()}33`,
                          borderColor: getQualityColor(),
                          borderWidth: "1px",
                        }}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Desempenho
                      </span>
                    </div>
                  </div>
                </div>
              );
            default:
              return (
                <div className="h-16 w-full flex items-center justify-center text-gray-400">
                  <div className="animate-pulse">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                </div>
              );
          }
        };

        return (
          <div
            className={`bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg transition-all duration-300 ${
              isHovered ? "shadow-xl transform scale-102" : ""
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-sky-500" />
              {node.data.label || "Gráfico"}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {node.data.description || "Visualização de progresso do paciente"}
            </div>
            <div
              className={`bg-white dark:bg-gray-800 rounded border p-3 transition-all duration-300 ${
                isHovered ? "shadow-md border-sky-300" : ""
              }`}
            >
              {renderChartPreviewInVisualizer()}
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            <p className="text-gray-500">Tipo de nó não reconhecido</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Passo{" "}
          {currentPath.length > 0
            ? currentPath.findIndex((step) => step === currentStep) + 1
            : currentStep + 1}{" "}
          de {currentPath.length > 0 ? currentPath.length : nodes.length}
        </span>
        <div className="flex space-x-1">
          {(currentPath.length > 0 ? currentPath : nodes).map(
            (nodeIndex, pathIndex) => {
              const actualIndex =
                currentPath.length > 0 ? nodeIndex : pathIndex;
              return (
                <div
                  key={actualIndex}
                  className={`w-2 h-2 rounded-full ${
                    actualIndex === currentStep ? "bg-blue-500" : "bg-gray-300"
                  }`}
                />
              );
            },
          )}
        </div>
      </div>

      {/* Current node content */}
      <div className="min-h-[200px]">{renderNode(currentNode)}</div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {(() => {
          // Check if there's a next node based on connections
          const hasNextNode =
            currentNode.type === "questionNode"
              ? currentNode.data.textInputOnly
                ? edges.some((edge) => edge.source === currentNode.id)
                : edges.some((edge) => edge.source === currentNode.id)
              : edges.some((edge) => edge.source === currentNode.id);

          const isActuallyLastStep =
            !hasNextNode || currentNode.type === "endNode";

          return !isActuallyLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className={!canProceed ? "opacity-50 cursor-not-allowed" : ""}
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="default"
              disabled={!canProceed && currentNode.type === "questionNode"}
              className={
                !canProceed && currentNode.type === "questionNode"
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          );
        })()}
      </div>

      {/* Guidance message for question nodes */}
      {currentNode.type === "questionNode" && !canProceed && (
        <div className="mt-2 text-center text-sm text-amber-600 dark:text-amber-400">
          <div className="flex items-center justify-center">
            <HelpCircle className="h-4 w-4 mr-1" />
            {currentNode.data.textInputOnly
              ? "Digite sua resposta para continuar"
              : "Selecione uma opção para continuar"}
          </div>
        </div>
      )}
    </div>
  );
};
